import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, Spool } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function SpoolInventory() {
  const { state, updateState } = useAppContext();
  const spools = state.spools || [];

  const [isOpen, setIsOpen] = useState(false);
  const [editingSpoolId, setEditingSpoolId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Partial<Spool>>({
    name: '',
    material: 'PLA',
    color: 'Black',
    colorHex: '#000000',
    originalWeight: 1000,
    remainingWeight: 1000,
    cost: 25.00
  });

  const handleOpenForm = (spool?: Spool) => {
    if (spool) {
      setFormState(spool);
      setEditingSpoolId(spool.id);
    } else {
      setFormState({
        name: '',
        material: 'PLA',
        color: 'Black',
        colorHex: '#000000',
        originalWeight: 1000,
        remainingWeight: 1000,
        cost: 25.00
      });
      setEditingSpoolId(null);
    }
  };

  const handleSaveSpool = () => {
    if (!formState.name) return;
    
    if (editingSpoolId) {
      updateState({
        spools: spools.map(s => s.id === editingSpoolId ? { ...s, ...formState } as Spool : s)
      });
    } else {
      const newSpool: Spool = {
        id: Date.now().toString(),
        name: formState.name || 'Unknown',
        material: formState.material || 'PLA',
        color: formState.color || 'Black',
        colorHex: formState.colorHex || '#000000',
        originalWeight: formState.originalWeight || 1000,
        remainingWeight: formState.remainingWeight || 1000,
        cost: formState.cost || 25
      };
      updateState({
        spools: [...spools, newSpool]
      });
    }
    setEditingSpoolId(null);
  };

  const handleDeleteSpool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState({ spools: spools.filter(s => s.id !== id) });
    if (editingSpoolId === id) setEditingSpoolId(null);
  };

  const calculateCostPerKg = (cost: number, originalWeight: number) => {
    if (!originalWeight) return 0;
    return (cost / (originalWeight / 1000)).toFixed(2);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Spool Inventory</h2>
                  </div>
                  
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{editingSpoolId ? 'Edit Spool' : 'Add New Spool'}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Brand / Name</label>
                      <input 
                        type="text" 
                        value={formState.name} 
                        onChange={e => setFormState({ ...formState, name: e.target.value })} 
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        placeholder="e.g. PolyTerra"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Material</label>
                        <select 
                          value={formState.material} 
                          onChange={e => setFormState({ ...formState, material: e.target.value })} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all appearance-none text-slate-800 dark:text-white"
                        >
                          <option>PLA</option>
                          <option>PLA+</option>
                          <option>PLA Matte</option>
                          <option>PLA Silk</option>
                          <option>PLA Tough</option>
                          <option>PLA CF</option>
                          <option>PETG</option>
                          <option>PETG Rapid</option>
                          <option>PETG CF</option>
                          <option>PETG Tough</option>
                          <option>PETG Translucent</option>
                          <option>ABS</option>
                          <option>TPU</option>
                          <option>ASA</option>
                          <option>Nylon</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Color Name</label>
                        <input 
                          type="text" 
                          value={formState.color} 
                          onChange={e => setFormState({ ...formState, color: e.target.value })} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Color Preview</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={formState.colorHex} 
                          onChange={e => setFormState({ ...formState, colorHex: e.target.value })} 
                          className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{formState.colorHex}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Orig. Weight (g)</label>
                        <input 
                          type="number" 
                          value={formState.originalWeight} 
                          onChange={e => setFormState({ ...formState, originalWeight: parseFloat(e.target.value) || 0 })} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Remain. (g)</label>
                        <input 
                          type="number" 
                          value={formState.remainingWeight} 
                          onChange={e => setFormState({ ...formState, remainingWeight: parseFloat(e.target.value) || 0 })} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Total Cost ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formState.cost} 
                        onChange={e => setFormState({ ...formState, cost: parseFloat(e.target.value) || 0 })} 
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={handleSaveSpool}
                      disabled={!formState.name}
                      className="flex-1 py-2 bg-blue-500/80 hover:bg-blue-600/90 text-white font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)] border border-blue-400/50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {editingSpoolId ? 'Update Spool' : 'Add Spool'}
                    </button>
                    {editingSpoolId && (
                      <button 
                        onClick={() => handleOpenForm()}
                        className="px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm rounded-xl hover:bg-white/70 dark:bg-slate-800/70 transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                {spools.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <p>No spools in inventory.</p>
                    <p className="text-sm mt-1">Add a spool to easily select it when calculating costs.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {spools.map(spool => (
                      <div 
                        key={spool.id} 
                        className={`bg-white/50 dark:bg-slate-800/50 border shadow-sm rounded-2xl p-4 flex flex-col transition-all duration-300 cursor-pointer ${editingSpoolId === spool.id ? 'border-blue-400 ring-1 ring-blue-400/50 bg-white/70 dark:bg-slate-800/70' : 'border-white/60 dark:border-slate-700/60 hover:bg-white/70 dark:bg-slate-800/70'}`}
                        onClick={() => handleOpenForm(spool)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full shadow-inner border border-white/60 dark:border-slate-700/60" style={{ backgroundColor: spool.colorHex }}></div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{spool.name}</h3>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteSpool(spool.id, e)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span>Material:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{spool.material} ({spool.color})</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className={`font-medium ${spool.remainingWeight < 200 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                              {spool.remainingWeight}g / {spool.originalWeight}g
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-1.5 rounded-full ${spool.remainingWeight < 200 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, (spool.remainingWeight / spool.originalWeight) * 100))}%` }}
                          ></div>
                        </div>
                        
                        <div className="mt-auto pt-2 border-t border-white/40 dark:border-slate-700/40 flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Cost: ${spool.cost.toFixed(2)}</span>
                          <span className="font-medium text-blue-600/80">${calculateCostPerKg(spool.cost, spool.originalWeight)}/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
    </div>
  );
}
