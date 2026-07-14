import React, { useState } from 'react';
import { useAppContext } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export function InvoiceHistory() {
  const { state, updateState } = useAppContext();
  const invoices = state.invoices || [];

  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (id: string, newStatus: 'Quoted' | 'Printing' | 'Post-Processing' | 'Completed', e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) e.stopPropagation();
    
    let inventoryUpdate = [...(state.inventoryExtraItems || [])];
    let spoolsUpdate = [...(state.spools || [])];
    
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === id) {
        const oldStatus = inv.status || 'Quoted';
        
        // If moving to Completed from something else
        if (newStatus === 'Completed' && oldStatus !== 'Completed') {
          // Deduct extra items
          inv.extraItems?.forEach(item => {
            if (item.inventoryItemId) {
              const invIndex = inventoryUpdate.findIndex(i => i.id === item.inventoryItemId);
              if (invIndex !== -1) {
                inventoryUpdate[invIndex] = {
                  ...inventoryUpdate[invIndex],
                  quantity: Math.max(0, (inventoryUpdate[invIndex].quantity || 0) - item.quantity)
                };
              }
            }
          });
          
          // Deduct filament spools
          inv.spoolDeductions?.forEach(deduction => {
            const spoolIndex = spoolsUpdate.findIndex(s => s.id === deduction.spoolId);
            if (spoolIndex !== -1) {
              spoolsUpdate[spoolIndex] = {
                ...spoolsUpdate[spoolIndex],
                remainingWeight: Math.max(0, (spoolsUpdate[spoolIndex].remainingWeight || 0) - deduction.weightUsed)
              };
            }
          });
        }
        // If moving away from Completed to something else
        else if (oldStatus === 'Completed' && newStatus !== 'Completed') {
          // Add back extra items
          inv.extraItems?.forEach(item => {
            if (item.inventoryItemId) {
              const invIndex = inventoryUpdate.findIndex(i => i.id === item.inventoryItemId);
              if (invIndex !== -1) {
                inventoryUpdate[invIndex] = {
                  ...inventoryUpdate[invIndex],
                  quantity: (inventoryUpdate[invIndex].quantity || 0) + item.quantity
                };
              }
            }
          });
          
          // Add back filament spools
          inv.spoolDeductions?.forEach(deduction => {
            const spoolIndex = spoolsUpdate.findIndex(s => s.id === deduction.spoolId);
            if (spoolIndex !== -1) {
              spoolsUpdate[spoolIndex] = {
                ...spoolsUpdate[spoolIndex],
                remainingWeight: (spoolsUpdate[spoolIndex].remainingWeight || 0) + deduction.weightUsed
              };
            }
          });
        }
        
        return { ...inv, status: newStatus };
      }
      return inv;
    });

    updateState({ 
      invoices: updatedInvoices,
      inventoryExtraItems: inventoryUpdate,
      spools: spoolsUpdate
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState({ invoices: invoices.filter(inv => inv.id !== id) });
  };

  const handleDownload = (inv: typeof invoices[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = inv.pdfDataUri;
    const invNumber = inv.invoiceNumber || inv.date.slice(0, 10);
    link.download = `Invoice-${invNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('jobId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'Quoted' | 'Printing' | 'Post-Processing' | 'Completed') => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      handleStatusChange(jobId, newStatus);
    }
  };

  const columns: ('Quoted' | 'Printing' | 'Post-Processing' | 'Completed')[] = ['Quoted', 'Printing', 'Post-Processing', 'Completed'];

  const exportToCSV = () => {
    if (!invoices || invoices.length === 0) return;
    
    const headers = [
      'Invoice Number',
      'Date',
      'Customer',
      'Project',
      'Status',
      'Total Amount'
    ];
    
    const rows = invoices.map(inv => [
      inv.invoiceNumber || '',
      new Date(inv.date).toLocaleDateString(),
      inv.customerName || '',
      inv.partName || '',
      inv.status || 'Quoted',
      inv.totalAmount.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 shadow-sm text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-md font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
        Job Tracker ({invoices.length})
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-[1400px] h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Job Tracker</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors font-medium text-sm border border-blue-200/50 dark:border-blue-800/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>
                      Export CSV
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                  </div>
                </div>

            {invoices.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 flex-1 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-800/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-700/60 border-dashed">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
                <p>No jobs found.</p>
                <p className="text-sm mt-1">Save a quote to see it appear here.</p>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 overflow-y-auto lg:overflow-y-hidden">
                {columns.map(column => {
                  const columnInvoices = invoices.filter(inv => (inv.status || 'Quoted') === column);
                  
                  return (
                    <div 
                      key={column} 
                      className="bg-white/30 dark:bg-slate-800/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/60 rounded-2xl flex flex-col min-h-[300px]"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column)}
                    >
                      <div className="p-4 font-bold text-slate-700 dark:text-slate-200 flex justify-between items-center border-b border-white/40 dark:border-slate-700/40">
                        {column}
                        <span className="bg-white/60 dark:bg-slate-800/60 shadow-sm border border-white/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-xs px-2 py-1 rounded-full">
                          {columnInvoices.length}
                        </span>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        {[...columnInvoices].reverse().map(inv => (
                          <div 
                            key={inv.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, inv.id)}
                            className="bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/80 shadow-sm rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:bg-white/90 hover:border-blue-300 hover:shadow-md cursor-grab active:cursor-grabbing group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{inv.partName}</h3>
                                <button 
                                  onClick={(e) => handleDelete(inv.id, e)}
                                  className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                  aria-label="Delete job"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                              </div>
                              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 inline-block mb-2">
                                {inv.customerName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                                <span>{new Date(inv.date).toLocaleDateString()}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">${inv.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-white/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                              <select
                                value={inv.status || 'Quoted'}
                                onChange={(e) => handleStatusChange(inv.id, e.target.value as any, e)}
                                className="text-xs font-semibold px-2 py-1 rounded-md border border-white/60 dark:border-slate-700/60 shadow-sm focus:ring-1 focus:ring-blue-400 outline-none cursor-pointer appearance-none bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white flex-1"
                              >
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newTab = window.open();
                                    if (newTab) {
                                      newTab.document.write(`<iframe width="100%" height="100%" src="${inv.pdfDataUri}" frameborder="0"></iframe>`);
                                    }
                                  }}
                                  className="p-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-slate-700/60 shadow-sm rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                                  title="View PDF"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                                <button 
                                  onClick={(e) => handleDownload(inv, e)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 border border-blue-400/50 shadow-[0_4px_12px_rgba(59,130,246,0.3)] rounded-md text-white transition-colors"
                                  title="Download PDF"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
