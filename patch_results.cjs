const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

// 1. Business Address
const fromAddressLogic = `    // From Address
    let fromY = 80;
    doc.text(state.companyName || 'mcut', 110, fromY);
    fromY += 5;

    const hasCompanyAddress = state.companyStreet || state.companyCity || state.companyCountry;
    if (hasCompanyAddress) {
      if (state.companyStreet) { doc.text(state.companyStreet, 110, fromY); fromY += 5; }
      if (state.companyCity || state.companyState || state.companyZip) {
        const line2 = [state.companyCity, state.companyState, state.companyZip].filter(Boolean).join(', ');
        doc.text(line2, 110, fromY); fromY += 5;
      }
      if (state.companyCountry) { doc.text(state.companyCountry, 110, fromY); fromY += 5; }
    } else {
      doc.text('292 rue Melrose', 110, fromY);
      fromY += 5;
      doc.text('Verdun, Qc H4H 1T3', 110, fromY);
      fromY += 5;
      doc.text('Canada', 110, fromY);
    }
    
    if (state.companyEmail) {
      doc.text(state.companyEmail, 110, fromY);
      fromY += 5;
    }
    if (state.companyPhone) {
      doc.text(state.companyPhone, 110, fromY);
      fromY += 5;
    }
    if (state.companyWebsite) {
      doc.text(state.companyWebsite, 110, fromY);
      fromY += 5;
    }`;

const newFromAddressLogic = `    // From Address
    let fromY = 80;
    doc.text(state.companyName || 'mcut', 110, fromY);
    fromY += 5;

    if (state.invoicePreferences?.showBusinessAddress !== false) {
      const hasCompanyAddress = state.companyStreet || state.companyCity || state.companyCountry;
      if (hasCompanyAddress) {
        if (state.companyStreet) { doc.text(state.companyStreet, 110, fromY); fromY += 5; }
        if (state.companyCity || state.companyState || state.companyZip) {
          const line2 = [state.companyCity, state.companyState, state.companyZip].filter(Boolean).join(', ');
          doc.text(line2, 110, fromY); fromY += 5;
        }
        if (state.companyCountry) { doc.text(state.companyCountry, 110, fromY); fromY += 5; }
      } else {
        doc.text('292 rue Melrose', 110, fromY);
        fromY += 5;
        doc.text('Verdun, Qc H4H 1T3', 110, fromY);
        fromY += 5;
        doc.text('Canada', 110, fromY);
      }
      
      if (state.companyEmail) {
        doc.text(state.companyEmail, 110, fromY);
        fromY += 5;
      }
      if (state.companyPhone) {
        doc.text(state.companyPhone, 110, fromY);
        fromY += 5;
      }
      if (state.companyWebsite) {
        doc.text(state.companyWebsite, 110, fromY);
        fromY += 5;
      }
    }`;

code = code.replace(fromAddressLogic, newFromAddressLogic);

// 2. Table Body (Material Breakdown and Print Time)
const tableBodyLogic = `    // Body rows per part
    let tableBody = partCalculations.map((p, idx) => {
      // Approximate the pre-tax price per unit for this part, proportionally to its baseCost
      const partRatio = baseCost > 0 ? (p.pBaseCost * p.part.quantity) / baseCost : 0;
      const partTotalPreTax = subtotalRaw * partRatio;
      const partUnitPrice = p.part.quantity > 0 ? partTotalPreTax / p.part.quantity : 0;
      
      return [
        (p.part.name || \`Part \${idx + 1}\`).replace(/[^\\x00-\\x7F]/g, ''),
        p.part.quantity.toString(),
        \`\${cSym}\${partUnitPrice.toFixed(2)}\`,
        \`\${cSym}\${partTotalPreTax.toFixed(2)}\`
      ];
    });`;

const newTableBodyLogic = `    // Body rows per part
    let tableBody = partCalculations.map((p, idx) => {
      // Approximate the pre-tax price per unit for this part, proportionally to its baseCost
      const partRatio = baseCost > 0 ? (p.pBaseCost * p.part.quantity) / baseCost : 0;
      const partTotalPreTax = subtotalRaw * partRatio;
      const partUnitPrice = p.part.quantity > 0 ? partTotalPreTax / p.part.quantity : 0;
      
      let description = (p.part.name || \`Part \${idx + 1}\`).replace(/[^\\x00-\\x7F]/g, '');
      
      if (state.invoicePreferences?.showMaterialBreakdown !== false) {
        const mats = p.part.materials.map(m => m.name).join(', ').replace(/[^\\x00-\\x7F]/g, '');
        if (mats) {
          description += \`\\nMaterial: \${mats}\`;
        }
      }

      if (state.invoicePreferences?.showPrintTime !== false) {
        description += \`\\nPrint time: \${p.part.printTimeHrs}h \${p.part.printTimeMin}m\`;
      }

      return [
        description,
        p.part.quantity.toString(),
        \`\${cSym}\${partUnitPrice.toFixed(2)}\`,
        \`\${cSym}\${partTotalPreTax.toFixed(2)}\`
      ];
    });`;

code = code.replace(tableBodyLogic, newTableBodyLogic);

// 3. Tax Percentages
const gstLogic = `    // GST
    if (state.applyTaxes && state.gstRate > 0) {
      doc.text(\`GST (\${state.gstRate}%)\`, 150, currentTotalsY, { align: 'right' });
      doc.text(\`\${cSym}\${gstAmount.toFixed(2)}\`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }`;

const newGstLogic = `    // GST
    if (state.applyTaxes && state.gstRate > 0) {
      const label = state.invoicePreferences?.showTaxPercentages !== false 
        ? \`GST (\${state.gstRate}%)\` 
        : 'GST';
      doc.text(label, 150, currentTotalsY, { align: 'right' });
      doc.text(\`\${cSym}\${gstAmount.toFixed(2)}\`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }`;

code = code.replace(gstLogic, newGstLogic);

const qstLogic = `    // QST
    if (state.applyTaxes && state.qstRate > 0) {
      doc.text(\`QST (\${state.qstRate}%)\`, 150, currentTotalsY, { align: 'right' });
      doc.text(\`\${cSym}\${qstAmount.toFixed(2)}\`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }`;

const newQstLogic = `    // QST
    if (state.applyTaxes && state.qstRate > 0) {
      const label = state.invoicePreferences?.showTaxPercentages !== false 
        ? \`QST (\${state.qstRate}%)\` 
        : 'QST';
      doc.text(label, 150, currentTotalsY, { align: 'right' });
      doc.text(\`\${cSym}\${qstAmount.toFixed(2)}\`, 196, currentTotalsY, { align: 'right' });
      currentTotalsY += 8;
    }`;

code = code.replace(qstLogic, newQstLogic);

fs.writeFileSync('src/components/Results.tsx', code);
