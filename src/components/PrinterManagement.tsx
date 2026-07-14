import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, Printer, MaintenanceLog } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function PrinterManagement() {
  const { state, updateState } = useAppContext();
  const printers = state.printers || [];
  const [isOpen, setIsOpen] = useState(false);

  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'maintenance'>('details');
  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceLog>>({ date: new Date().toISOString().split('T')[0], task: '', cost: 0, notes: '' });
  const [formState, setFormState] = useState<Partial<Printer>>({
    name: '',
    model: '',
    powerWatts: 0,
    cost: 0,
    lifespanHours: 0
  });

  const handleOpenForm = (printer?: Printer) => {
    if (printer) {
      setFormState(printer);
      setEditingPrinterId(printer.id);
      setActiveTab('details');
      setIsAdding(false);
    } else {
      setFormState({
        name: '',
        model: '',
        powerWatts: state.printerPower || 250,
        cost: state.printerCost || 800,
        lifespanHours: state.printerLifespanHours || 10000
      });
      setEditingPrinterId(null);
      setActiveTab('details');
      setIsAdding(true);
    }
  };

  
  const handleSaveMaintenance = () => {
    if (!maintenanceForm.task || !editingPrinterId) return;
    
    const newLog: MaintenanceLog = {
      id: Date.now().toString(),
      date: maintenanceForm.date || new Date().toISOString().split('T')[0],
      task: maintenanceForm.task,
      cost: maintenanceForm.cost || 0,
      notes: maintenanceForm.notes || ''
    };
    
    const updatedPrinters = printers.map(p => {
      if (p.id === editingPrinterId) {
        return {
          ...p,
          maintenanceLogs: [...(p.maintenanceLogs || []), newLog]
        };
      }
      return p;
    });
    
    updateState({ printers: updatedPrinters });
    setMaintenanceForm({ date: new Date().toISOString().split('T')[0], task: '', cost: 0, notes: '' });
  };
  
  const handleDeleteMaintenance = (logId: string) => {
    if (!editingPrinterId) return;
    const updatedPrinters = printers.map(p => {
      if (p.id === editingPrinterId) {
        return {
          ...p,
          maintenanceLogs: (p.maintenanceLogs || []).filter(l => l.id !== logId)
        };
      }
      return p;
    });
    updateState({ printers: updatedPrinters });
  };

  const handleSavePrinter = () => {
    if (!formState.name) return;
    
    if (editingPrinterId) {
      updateState({
        printers: printers.map(p => p.id === editingPrinterId ? { ...p, ...formState } as Printer : p)
      });
    } else {
      const newPrinter: Printer = {
        id: Date.now().toString(),
        name: formState.name || 'New Printer',
        model: formState.model || 'Generic',
        powerWatts: formState.powerWatts || 0,
        cost: formState.cost || 0,
        lifespanHours: formState.lifespanHours || 0
      };
      updateState({
        printers: [...printers, newPrinter]
      });
    }
    setEditingPrinterId(null);
    setIsAdding(false);
  };

  const handleDeletePrinter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState({ printers: printers.filter(p => p.id !== id) });
    if (editingPrinterId === id) setEditingPrinterId(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 shadow-sm text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-md font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/><circle cx="10" cy="18" r="1"/></svg>
        Farm Management ({printers.length})
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Printer Farm Management</h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                  {/* List View */}
                  <div className="w-full md:w-1/2 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-900/30">
                    <button 
                      onClick={() => handleOpenForm()}
                      className="w-full py-3 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      Add New Printer
                    </button>

                    {printers.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                        <p className="mb-4">Your printer farm is empty.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {printers.map((printer) => (
                          <div 
                            key={printer.id}
                            onClick={() => handleOpenForm(printer)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              editingPrinterId === printer.id 
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-500'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{printer.name}</h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{printer.model}</div>
                              </div>
                              <button 
                                onClick={(e) => handleDeletePrinter(printer.id, e)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{printer.powerWatts}W</span>
                              <span className="text-slate-500 dark:text-slate-400">{printer.lifespanHours} hrs life</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form View */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                    {editingPrinterId !== null || isAdding || printers.length === 0 ? (

                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                            {editingPrinterId ? 'Edit Printer' : 'Add New Printer'}
                          </h3>
                          {(editingPrinterId || isAdding) && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                              <button 
                                onClick={() => setActiveTab('details')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'details' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                              >
                                Details
                              </button>
                              <button 
                                onClick={() => setActiveTab('maintenance')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'maintenance' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                              >
                                Maintenance
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {activeTab === 'details' ? (
                          <>
                            <div className="space-y-4 flex-1">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Printer Name</label>
                                <input 
                                  type="text" 
                                  value={formState.name || ''}
                                  onChange={e => setFormState({...formState, name: e.target.value})}
                                  placeholder="e.g. Prusa MK3S+ #1"
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                                <input 
                                  type="text" 
                                  value={formState.model || ''}
                                  onChange={e => setFormState({...formState, model: e.target.value})}
                                  placeholder="e.g. MK3S+"
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Power Draw (Watts)</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      value={formState.powerWatts || 0}
                                      onChange={e => setFormState({...formState, powerWatts: parseFloat(e.target.value) || 0})}
                                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8 text-slate-800 dark:text-slate-100"
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400">W</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Machine Cost</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400">$</span>
                                    <input 
                                      type="number" 
                                      value={formState.cost || 0}
                                      onChange={e => setFormState({...formState, cost: parseFloat(e.target.value) || 0})}
                                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-8 text-slate-800 dark:text-slate-100"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lifespan (Hours)</label>
                                <input 
                                  type="number" 
                                  value={formState.lifespanHours || 0}
                                  onChange={e => setFormState({...formState, lifespanHours: parseFloat(e.target.value) || 0})}
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expected running hours before replacement (used for depreciation)</p>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <button 
                                onClick={handleSavePrinter}
                                disabled={!formState.name}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition-colors"
                              >
                                {editingPrinterId ? 'Update Printer' : 'Add Printer'}
                              </button>
                              {editingPrinterId && (
                                <button 
                                  onClick={() => { setEditingPrinterId(null); setIsAdding(false); }}
                                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col flex-1 h-full overflow-hidden">
                            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                              <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Log Maintenance Task</h4>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
                                  <input 
                                    type="date" 
                                    value={maintenanceForm.date || ''}
                                    onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})}
                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cost ($)</label>
                                  <input 
                                    type="number" 
                                    value={maintenanceForm.cost || 0}
                                    onChange={e => setMaintenanceForm({...maintenanceForm, cost: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                  />
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Task / Part Replaced</label>
                                <input 
                                  type="text" 
                                  value={maintenanceForm.task || ''}
                                  onChange={e => setMaintenanceForm({...maintenanceForm, task: e.target.value})}
                                  placeholder="e.g. Replaced nozzle, Lubricated rods..."
                                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Notes</label>
                                <input 
                                  type="text" 
                                  value={maintenanceForm.notes || ''}
                                  onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})}
                                  placeholder="Optional notes..."
                                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <button 
                                onClick={handleSaveMaintenance}
                                disabled={!maintenanceForm.task}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Add Log Entry
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                              <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Maintenance History</h4>
                              {editingPrinterId && (
                                (() => {
                                  const currentPrinter = printers.find(p => p.id === editingPrinterId);
                                  const logs = currentPrinter?.maintenanceLogs || [];
                                  
                                  if (logs.length === 0) {
                                    return (
                                      <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                                        No maintenance logs yet.
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="space-y-3">
                                      {logs.map(log => (
                                        <div key={log.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/80 text-sm">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{log.task}</span>
                                            <button 
                                              onClick={() => handleDeleteMaintenance(log.id)}
                                              className="text-red-400 hover:text-red-600 ml-2"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </button>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            <span>{log.date}</span>
                                            {log.cost > 0 && <span className="font-medium text-slate-700 dark:text-slate-300">$\{log.cost.toFixed(2)}</span>}
                                          </div>
                                          {log.notes && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic border-t border-slate-100 dark:border-slate-700/50 pt-1">
                                              {log.notes}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        <p>Select a printer to edit or add a new one.</p>
                      </div>
                    )}
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
