import React, { useState } from 'react';
import { useAppContext } from '../lib/store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Results() {
  const { state, updateState } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculations
  const partCalculations = state.parts.map(part => {
    const pMaterialCost = part.materials.reduce((sum, m) => sum + (m.weight / 1000) * m.costPerKg, 0);
    const pTotalWeight = part.materials.reduce((sum, m) => sum + m.weight, 0);
    const pPrintTimeHours = part.printTimeHrs + (part.printTimeMin / 60);
    
    // Costs per single unit of this part
    const pElectricityCost = (state.printerPower * pPrintTimeHours / 1000) * state.electricityCost;
    const pMachineCost = (state.printerCost / state.printerLifespanHours) * pPrintTimeHours;
    
    const pBaseCost = pMaterialCost + pElectricityCost + pMachineCost;
    
    return {
      part,
      pMaterialCost,
      pTotalWeight,
      pPrintTimeHours,
      pElectricityCost,
      pMachineCost,
      pBaseCost,
      unitCost: pBaseCost * part.quantity, // wait, this is base cost for this part type. 
    };
  });

  const totalMaterialCost = partCalculations.reduce((sum, p) => sum + (p.pMaterialCost * p.part.quantity), 0);
  const totalWeight = partCalculations.reduce((sum, p) => sum + (p.pTotalWeight * p.part.quantity), 0);
  const printTimeHours = partCalculations.reduce((sum, p) => sum + (p.pPrintTimeHours * p.part.quantity), 0);
  const electricityCost = partCalculations.reduce((sum, p) => sum + (p.pElectricityCost * p.part.quantity), 0);
  const machineCost = partCalculations.reduce((sum, p) => sum + (p.pMachineCost * p.part.quantity), 0);

  const postProcessingTime = (state.postProcessingTasks || []).reduce((sum, task) => sum + (task.timeMin || 0), 0);
  const totalLaborTimeMin = (state.laborTimeMin || 0) + postProcessingTime;
  const laborCost = (totalLaborTimeMin / 60) * (state.laborRatePerHour || 0);
  
  const extraItemsTotal = (state.extraItems || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);

  const baseCost = totalMaterialCost + electricityCost + laborCost + machineCost + (state.hardwareCost || 0) + (state.packagingCost || 0);
  const failureCost = baseCost * (state.failureRate / 100);
  const subtotal = baseCost + failureCost;
  
  const calculateTotal = (margin: number) => {
    const markupAmount = subtotal * (margin / 100);
    let preTaxTotal = subtotal + markupAmount + (state.shippingCost || 0) + extraItemsTotal;
    
    // Calculate discount
    const discountVal = state.discountValue || 0;
    if (state.discountType === 'percentage') {
      preTaxTotal = preTaxTotal * (1 - discountVal / 100);
    } else {
      preTaxTotal = Math.max(0, preTaxTotal - discountVal);
    }
    
    const gstAmount = state.applyTaxes ? preTaxTotal * (state.gstRate / 100) : 0;
    const qstAmount = state.applyTaxes ? preTaxTotal * (state.qstRate / 100) : 0;
    return preTaxTotal + gstAmount + qstAmount;
  };
  
  const calculatePreTax = (margin: number) => {
    const markupAmount = subtotal * (margin / 100);
    let preTaxTotal = subtotal + markupAmount + (state.shippingCost || 0) + extraItemsTotal;
    const discountVal = state.discountValue || 0;
    if (state.discountType === 'percentage') {
      preTaxTotal = preTaxTotal * (1 - discountVal / 100);
    } else {
      preTaxTotal = Math.max(0, preTaxTotal - discountVal);
    }
    return preTaxTotal;
  };
  
  const activeMargin = state.selectedMargin;
  const batchTotal = calculateTotal(activeMargin);
  const unitTotal = batchTotal; // Total for the whole project
  const quantity = 1; // Project quantity could be added later, for now batchTotal is the project total


  const generatePdfBase64 = async (): Promise<string> => {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });
    
    const primaryColor: [number, number, number] = [30, 30, 30]; 
    const secondaryColor: [number, number, number] = [80, 80, 80];

    const selectedCustomer = state.customers.find(c => c.id === state.selectedCustomerId);
    const invoiceNumber = state.nextInvoiceNumber.toString().padStart(6, '0');

    // Header - Logo and No.
    if (state.invoiceLogo) {
      try {
        const img = new Image();
        img.src = state.invoiceLogo;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        
        if (img.width && img.height) {
          const aspect = img.width / img.height;
          let finalHeight = 20;
          let finalWidth = 20 * aspect;
          if (finalWidth > 60) {
            finalWidth = 60;
            finalHeight = 60 / aspect;
          }
          doc.addImage(state.invoiceLogo, 14, 10, finalWidth, finalHeight, undefined, 'FAST');
        } else {
          doc.addImage(state.invoiceLogo, 14, 10, 40, 20, undefined, 'FAST');
        }
      } catch (e) {
        console.warn('Failed to add custom invoice logo', e);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(75, 82, 158);
        doc.text('mcut', 14, 20);
        doc.setFillColor(184, 212, 123);
        doc.circle(41, 16, 3, 'F');
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(75, 82, 158);
      doc.text('mcut', 14, 20);
      doc.setFillColor(184, 212, 123);
      doc.circle(41, 16, 3, 'F');
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(`NO. ${invoiceNumber}`, 196, 20, { align: 'right' });

    // INVOICE Title
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 45);

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date: ', 14, 60);
    doc.setFont('helvetica', 'normal');
    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateStr = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    doc.text(dateStr, 24, 60);

    // Billed to / From
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to:', 14, 75);
    doc.text('From:', 110, 75);

    // To Address
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    let currentY = 80;
    doc.text(selectedCustomer ? selectedCustomer.name : 'Valued Client', 14, currentY);
    currentY += 5;
    
    if (selectedCustomer) {
      if (selectedCustomer.street) {
        doc.text(selectedCustomer.street, 14, currentY);
        currentY += 5;
      }
      
      const cityStateZip = [
        selectedCustomer.city, 
        selectedCustomer.state ? `${selectedCustomer.state}` : '', 
        selectedCustomer.zip
      ].filter(Boolean).join(', ');
      
      if (cityStateZip) {
        doc.text(cityStateZip, 14, currentY);
        currentY += 5;
      }
      
      if (selectedCustomer.country) {
        doc.text(selectedCustomer.country, 14, currentY);
        currentY += 5;
      }
    } else {
      doc.text('Placeholder Address', 14, currentY);
    }

    // From Address
    let fromY = 80;
    doc.text('mcut', 110, fromY);
    fromY += 5;
    doc.text('292 rue Melrose', 110, fromY);
    fromY += 5;
    doc.text('Verdun, Qc H4H 1T3', 110, fromY);
    fromY += 5;
    doc.text('Canada', 110, fromY);

    // Table
    const safeProjectName = (state.projectName || 'New Project').replace(/[^\x00-\x7F]/g, '');
    
    // Total for the whole project pre-tax based on margin
    const subtotalRaw = subtotal * (1 + activeMargin / 100);
    const tableSubtotal = subtotalRaw + extraItemsTotal;
    const preTaxProjectTotal = calculatePreTax(activeMargin);
    const finalBatchTotal = calculateTotal(activeMargin);
    const gstAmount = state.applyTaxes ? preTaxProjectTotal * (state.gstRate / 100) : 0;
    const qstAmount = state.applyTaxes ? preTaxProjectTotal * (state.qstRate / 100) : 0;
    const discountVal = state.discountValue || 0;

    // Body rows per part
    let tableBody = partCalculations.map((p, idx) => {
      // Approximate the pre-tax price per unit for this part, proportionally to its baseCost
      const partRatio = baseCost > 0 ? (p.pBaseCost * p.part.quantity) / baseCost : 0;
      const partTotalPreTax = subtotalRaw * partRatio;
      const partUnitPrice = p.part.quantity > 0 ? partTotalPreTax / p.part.quantity : 0;

      return [
        (p.part.name || `Part ${idx + 1}`).replace(/[^\x00-\x7F]/g, ''),
        p.part.quantity.toString(),
        `$${partUnitPrice.toFixed(2)}`,
        `$${partTotalPreTax.toFixed(2)}`
      ];
    });

    if (state.postProcessingTasks && state.postProcessingTasks.length > 0) {
      state.postProcessingTasks.forEach((task) => {
        if (task.name) {
          tableBody.push([
            `Task: ${task.name}`.replace(/[^\x00-\x7F]/g, ''),
            `${task.timeMin || 0} min`,
            'Included',
            '-'
          ]);
        }
      });
    }

    if (state.extraItems && state.extraItems.length > 0) {
      state.extraItems.forEach((item) => {
        if (item.name) {
          const qty = item.quantity || 0;
          const price = item.price || 0;
          const amount = qty * price;
          tableBody.push([
            `Extra: ${item.name}`.replace(/[^\x00-\x7F]/g, ''),
            qty.toString(),
            `$${price.toFixed(2)}`,
            `$${amount.toFixed(2)}`
          ]);
        }
      });
    }

    autoTable(doc, {
      startY: 105,
      head: [['Item', 'Quantity', 'Price', 'Amount']],
      body: tableBody,
      theme: 'plain',
      headStyles: { 
        fillColor: [230, 230, 230], 
        textColor: primaryColor,
        fontStyle: 'normal',
        halign: 'left'
      },
      bodyStyles: {
        textColor: secondaryColor,
        halign: 'left',
        lineWidth: { bottom: 0.5 },
        lineColor: [230, 230, 230]
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    const tableEndY = (doc as any).lastAutoTable?.finalY || 120;

    let currentTotalsY = tableEndY + 10;
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text('Subtotal', 150, currentTotalsY, { align: 'right' });
    doc.text(`$${tableSubtotal.toFixed(2)}`, 196, currentTotalsY, { align: 'right' });
    currentTotalsY += 8;

    // Shipping
    if (state.shippingCost > 0) {
      doc.text('Shipping', 150, currentTotalsY, { align: 'right' });
      doc.text(`$${state.shippingCost.toFixed(2)}`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }

    // Discount
    if (discountVal > 0) {
      doc.text('Discount', 150, currentTotalsY, { align: 'right' });
      const discountDisplay = state.discountType === 'percentage' 
        ? `-${discountVal}%`
        : `-$${discountVal.toFixed(2)}`;
      doc.text(discountDisplay, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }

    // GST
    if (state.applyTaxes && state.gstRate > 0) {
      doc.text(`GST (${state.gstRate}%)`, 150, currentTotalsY, { align: 'right' });
      doc.text(`$${gstAmount.toFixed(2)}`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }

    // QST
    if (state.applyTaxes && state.qstRate > 0) {
      doc.text(`QST (${state.qstRate}%)`, 150, currentTotalsY, { align: 'right' });
      doc.text(`$${qstAmount.toFixed(2)}`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }

    // Total Row
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total', 150, currentTotalsY + 2, { align: 'right' });
    doc.text(`$${finalBatchTotal.toFixed(2)}`, 196, currentTotalsY + 2, { align: 'right' });
    
    // Line under total
    doc.setDrawColor(230, 230, 230);
    doc.line(14, currentTotalsY + 7, 196, currentTotalsY + 7);

    // Footer Info
    doc.setFontSize(10);
    if (state.paymentTerms) {
      doc.setFont('helvetica', 'bold');
      doc.text('Terms: ', 14, currentTotalsY + 16);
      doc.setFont('helvetica', 'normal');
      doc.text(state.paymentTerms.replace(/[^\x00-\x7F]/g, ''), 28, currentTotalsY + 16);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Note: ', 14, currentTotalsY + 24);
    doc.setFont('helvetica', 'normal');
    
    const safeNotes = (state.invoiceNotes || 'Thank you for your business!').replace(/[^\x00-\x7F]/g, '');
    const splitNotes = doc.splitTextToSize(safeNotes, 120);
    doc.text(splitNotes, 25, currentTotalsY + 24);

    const arrayBuffer = doc.output('arraybuffer');
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const savePdfLocal = async () => {
    setIsSyncing(true);
    try {
      const base64 = await generatePdfBase64();
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const invoiceNumber = state.nextInvoiceNumber.toString().padStart(6, '0');
      link.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const selectedCustomer = state.customers.find(c => c.id === state.selectedCustomerId);
      const newInvoice = {
        id: Date.now().toString(),
        invoiceNumber,
        date: new Date().toISOString(),
        partName: state.projectName || 'New Project',
        customerName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
        totalAmount: batchTotal,
        pdfDataUri: `data:application/pdf;base64,${base64}`,
        extraItems: state.extraItems
      };
      
      let spoolsUpdate = state.spools || [];
      
      // Calculate total weight used per spool across all parts
      const spoolUsageMap = new Map<string, number>();
      state.parts.forEach(part => {
        part.materials.forEach(m => {
          if (m.spoolId && m.weight > 0) {
            const current = spoolUsageMap.get(m.spoolId) || 0;
            spoolUsageMap.set(m.spoolId, current + (m.weight * (part.quantity || 1)));
          }
        });
      });
      
      if (spoolUsageMap.size > 0 && window.confirm("Deduct printed material weight from your spool inventory?")) {
        spoolsUpdate = spoolsUpdate.map(spool => {
          const usedWeight = spoolUsageMap.get(spool.id);
          if (usedWeight) {
            return {
              ...spool,
              remainingWeight: Math.max(0, spool.remainingWeight - usedWeight)
            };
          }
          return spool;
        });
      }
      
      updateState({ 
        invoices: [...(state.invoices || []), newInvoice],
        spools: spoolsUpdate,
        nextInvoiceNumber: state.nextInvoiceNumber + 1,
        projectName: '',
        parts: [
          {
            id: Date.now().toString(),
            name: '',
            isMultiMaterial: false,
            materials: [
              { id: Date.now().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
            ],
            printTimeHrs: 0,
            printTimeMin: 0,
            quantity: 1,
          }
        ],
        selectedCustomerId: null,
        postProcessingTasks: [],
        extraItems: [],
        laborTimeMin: 0,
        hardwareCost: 0,
        packagingCost: 0,
        shippingCost: 0,
        discountValue: 0
      });
    } catch (error: any) {
      console.error('Failed to save PDF', error);
      alert('Failed to save PDF: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCustomMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    updateState({ customMargin: val, selectedMargin: val });
  };

  const pricingTiers = [
    { id: 'competitive', name: 'Competitive', margin: 25, color: 'bg-emerald-300/30 border border-emerald-400/40 backdrop-blur-md', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'standard', name: 'Standard', margin: 40, color: 'bg-blue-300/30 border border-blue-400/40 backdrop-blur-md', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { id: 'premium', name: 'Premium', margin: 60, color: 'bg-amber-300/30 border border-amber-400/40 backdrop-blur-md', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> },
    { id: 'luxury', name: 'Luxury', margin: 80, color: 'bg-purple-300/30 border border-purple-400/40 backdrop-blur-md', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> },
  ];

  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/40 dark:border-slate-700/40 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 dark:text-slate-100 drop-shadow-sm"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Suggested Pricing</h2>
      </div>

      <div className="space-y-4">
        {pricingTiers.map((tier) => {
          const finalTotal = calculateTotal(tier.margin);
          const isSelected = activeMargin === tier.margin;
          return (
            <div 
              key={tier.id}
              onClick={() => updateState({ selectedMargin: tier.margin })}
              className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 ${tier.color} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-200/50 shadow-lg scale-[1.02]' : 'hover:scale-[1.01] hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                  {tier.icon}
                  <span className="font-medium text-lg">{tier.name}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  ${finalTotal.toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                <span>+{tier.margin}% profit margin</span>
                {state.applyTaxes ? (
                  <span>${calculatePreTax(tier.margin).toFixed(2)} pre-tax</span>
                ) : (
                  <span>No taxes applied</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Custom Tier */}
        <div 
          onClick={() => updateState({ selectedMargin: state.customMargin })}
          className={`p-5 rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 cursor-pointer transition-all duration-300 ${activeMargin === state.customMargin && !pricingTiers.find(t => t.margin === state.customMargin) ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-200/50 shadow-lg scale-[1.02]' : 'hover:scale-[1.01] hover:shadow-md'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              <span className="font-medium text-lg">Custom</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              ${calculateTotal(state.customMargin).toFixed(2)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={state.customMargin} 
              onChange={handleCustomMarginChange}
              className="flex-1 h-2 bg-white/50 dark:bg-slate-800/50 rounded-lg appearance-none cursor-pointer accent-blue-500 shadow-inner text-slate-800 dark:text-white"
            />
            <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-xl px-2 py-1 shadow-inner">
              <input 
                type="number" 
                value={state.customMargin} 
                onChange={handleCustomMarginChange}
                className="w-12 text-center bg-transparent focus:outline-none font-medium text-slate-800 dark:text-white"
              />
              <span className="text-slate-600 dark:text-slate-300 text-sm">%</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
            <span>+{state.customMargin}% profit margin</span>
            {state.applyTaxes ? (
              <span>${calculatePreTax(state.customMargin).toFixed(2)} pre-tax</span>
            ) : (
              <span>No taxes applied</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/40 dark:border-slate-700/40 flex flex-col items-stretch gap-4">
        <div className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-200 px-2 drop-shadow-sm">
          <span>Total Project: <span className="font-bold text-slate-900 dark:text-slate-50">${unitTotal.toFixed(2)} {state.applyTaxes ? 'incl. taxes' : 'pre-tax'}</span></span>
          <span>{activeMargin}% profit margin</span>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={savePdfLocal}
            disabled={isSyncing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-slate-700/60 shadow-[0_4px_12px_rgba(255,255,255,0.2)] text-slate-800 dark:text-slate-100 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm"
          >
            {isSyncing ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            )}
            Save Quote
          </button>
          
          {navigator.canShare && (
            <button
              onClick={async () => {
                try {
                  const base64 = await generatePdfBase64();
                  const binaryString = window.atob(base64);
                  const len = binaryString.length;
                  const bytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const invoiceNumber = state.nextInvoiceNumber.toString().padStart(6, '0');
                  const file = new File([bytes], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' });
                  
                  if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                      files: [file],
                      title: '3D Print Quote',
                      text: 'Here is your 3D print quote.'
                    });
                  }
                } catch (error) {
                  console.error('Error sharing:', error);
                }
              }}
              className="flex-none flex items-center justify-center w-12 h-12 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-slate-700/60 shadow-[0_4px_12px_rgba(255,255,255,0.2)] text-slate-800 dark:text-slate-100 rounded-2xl transition-all duration-300 backdrop-blur-sm"
              aria-label="Share Quote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
