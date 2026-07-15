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
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <h2 className="text-xl font-bold uppercase tracking-widest">Printer Management</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* LEFT PANE */}
        <div className="col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6 flex flex-col h-full overflow-hidden">
          <button 
            onClick={() => handleOpenForm()} 
            className="w-full mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl border border-blue-200 dark:border-blue-800/30 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Printer
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {printers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                No printers added yet.
              </div>
            ) : (
              printers.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleOpenForm(p)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${editingPrinterId === p.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600'}`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                    <span>{p.model}</span>
                    <button onClick={(e) => handleDeletePrinter(p.id, e)} className="text-red-400 hover:text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* RIGHT PANE */}
        <div className="col-span-1 md:col-span-2 flex flex-col h-full">
          {(editingPrinterId || isAdding) ? (
            <div className="flex flex-col flex-1 h-full">
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
    </div>
  );
}
