import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, Spool } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function SpoolInventory() {
  const { state, updateState } = useAppContext();
  const spools = state.spools || [];

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredSpools = spools.filter(spool => 
    spool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spool.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spool.color.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Spool Inventory</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input
                        type="search"
                        placeholder="Search spools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-sm text-slate-800 dark:text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700/50 shrink-0">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Grid View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="List View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
              <div className="md:col-span-1 lg:col-span-1 space-y-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              
              <div className="md:col-span-2 lg:col-span-2">
                {filteredSpools.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <p>{searchQuery ? 'No spools found matching your search.' : 'No spools in inventory.'}</p>
                    {!searchQuery && <p className="text-sm mt-1">Add a spool to easily select it when calculating costs.</p>}
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
                    {filteredSpools.map(spool => (
                      <div 
                        key={spool.id} 
                        className={`bg-white/50 dark:bg-slate-800/50 border shadow-sm rounded-2xl p-4 transition-all duration-300 cursor-pointer ${editingSpoolId === spool.id ? 'border-blue-400 ring-1 ring-blue-400/50 bg-white/70 dark:bg-slate-800/70' : 'border-white/60 dark:border-slate-700/60 hover:bg-white/70 dark:bg-slate-800/70'} ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row items-center gap-4'}`}
                        onClick={() => handleOpenForm(spool)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <div className="w-4 h-4 rounded-full shadow-inner border border-white/60 dark:border-slate-700/60" style={{ backgroundColor: spool.colorHex }}></div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{spool.name}</h3>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteSpool(spool.id, e)}
                                className="text-red-400 hover:text-red-600 transition-colors shrink-0"
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
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full shadow-inner border border-white/60 dark:border-slate-700/60 shrink-0" style={{ backgroundColor: spool.colorHex }}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate pr-2">{spool.name}</h3>
                                <div className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{spool.material}</div>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className={`${spool.remainingWeight < 200 ? 'text-red-500 font-medium' : ''}`}>
                                  {spool.remainingWeight}g / {spool.originalWeight}g
                                </span>
                                <span>${calculateCostPerKg(spool.cost, spool.originalWeight)}/kg</span>
                              </div>
                              <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-1 mt-1.5 overflow-hidden shadow-inner">
                                <div 
                                  className={`h-1 rounded-full ${spool.remainingWeight < 200 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                                  style={{ width: `${Math.min(100, Math.max(0, (spool.remainingWeight / spool.originalWeight) * 100))}%` }}
                                ></div>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => handleDeleteSpool(spool.id, e)}
                              className="text-red-400 hover:text-red-600 transition-colors shrink-0 ml-2 p-1 bg-red-50/50 hover:bg-red-100/50 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-md"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
    </div>
  );
}
