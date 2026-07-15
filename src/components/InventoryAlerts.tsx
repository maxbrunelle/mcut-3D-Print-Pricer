import React, { useState } from 'react';
import { useAppContext } from '../lib/store';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export function InventoryAlerts() {
  const { state, updateState } = useAppContext();
  const getCurrencySymbol = (code: string | undefined) => {
    switch (code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  const cSym = getCurrencySymbol(state.currency);
  const [isOpen, setIsOpen] = useState(false);

  const [viewedAlerts, setViewedAlerts] = useState<string[]>([]);

  const lowSpools = (state.spools || []).filter(s => s.remainingWeight < 200);
  const lowItems = (state.inventoryExtraItems || []).filter(i => i.quantity < 5);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  oneWeekFromNow.setHours(23, 59, 59, 999);

  const upcomingInvoices = (state.invoices || []).filter(inv => {
    if (!inv.dueDate || inv.status === 'Completed') return false;
    // Handle YYYY-MM-DD by parsing local date
    const [y, m, d] = inv.dueDate.split('T')[0].split('-').map(Number);
    const dueDate = new Date(y, m - 1, d);
    return dueDate >= now && dueDate <= oneWeekFromNow;
  });

  const upcomingJobs = (state.scheduledJobs || []).filter(sj => {
    const startTime = new Date(sj.startTime);
    return startTime >= now && startTime <= oneWeekFromNow;
  });

  const currentAlertIds = [
    ...lowSpools.map(s => `spool-${s.id}`),
    ...lowItems.map(i => `item-${i.id}`),
    ...upcomingInvoices.map(i => `inv-${i.id}`),
    ...upcomingJobs.map(j => `job-${j.id}`)
  ];

  const unviewedCount = currentAlertIds.filter(id => !viewedAlerts.includes(id)).length;

  const handleOpen = () => {
    setIsOpen(true);
    setViewedAlerts(prev => Array.from(new Set([...prev, ...currentAlertIds])));
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
          {unviewedCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          )}
        </div>
        Notifications
        {unviewedCount > 0 && (
          <span className="ml-auto text-[10px] py-0.5 px-2 rounded-full font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {unviewedCount}
          </span>
        )}
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
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-4xl max-h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <Bell size={24} className="text-rose-500" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Inventory Alerts</h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    Low Spools Inventory ({lowSpools.length})
                  </h3>
                  <div className="space-y-3">
                    {lowSpools.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                        All spools are sufficiently stocked.
                      </div>
                    ) : (
                      lowSpools.map((spool) => (
                        <div key={spool.id} className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: spool.colorHex }}></div>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{spool.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{spool.material} • {spool.color}</div>
                            </div>
                          </div>
                          <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                            {spool.remainingWeight.toFixed(0)}g left
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    Low Extra Items ({lowItems.length})
                  </h3>
                  <div className="space-y-3">
                    {lowItems.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                        All extra items are sufficiently stocked.
                      </div>
                    ) : (
                      lowItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{cSym}{item.price.toFixed(2)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                              {item.quantity} left
                            </div>
                            {item.rebuyLink && (
                              <a href={item.rebuyLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline inline-flex items-center gap-1">
                                Reorder
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-indigo-700 dark:text-indigo-400 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Upcoming Scheduled Jobs ({upcomingJobs.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingJobs.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                        No jobs scheduled within the next 7 days.
                      </div>
                    ) : (
                      upcomingJobs.map((sj) => {
                        const printer = state.printers.find(p => p.id === sj.printerId);
                        const start = new Date(sj.startTime);
                        return (
                          <div key={sj.id} className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate max-w-[150px]">{sj.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{printer?.name || 'Unknown Printer'}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                {start.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-fuchsia-700 dark:text-fuchsia-400 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Upcoming Invoice Deadlines ({upcomingInvoices.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingInvoices.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                        No invoices due within the next 7 days.
                      </div>
                    ) : (
                      upcomingInvoices.map((inv) => {
                        const [y, m, d] = inv.dueDate!.split('T')[0].split('-').map(Number);
                        const due = new Date(y, m - 1, d);
                        return (
                          <div key={inv.id} className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30">
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate max-w-[150px]">{inv.partName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">#{inv.invoiceNumber}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-fuchsia-600 dark:text-fuchsia-400 font-bold text-sm">
                                {due.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}