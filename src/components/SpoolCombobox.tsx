import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Spool } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../lib/store';

interface Props {
  value: string; // The current spoolId or custom name
  spools: Spool[];
  onChange: (spoolId: string | undefined, name: string, costPerKg?: number) => void;
  className?: string;
}

export function SpoolCombobox({ value, spools, onChange, className }: Props) {
  const { state } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const standardTypes = ['PLA', 'PETG', 'ABS', 'TPU'];
  
  const filteredStandard = standardTypes.filter(t => t.toLowerCase().includes(search.toLowerCase()));
  const filteredSpools = spools.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.material.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSpool = spools.find(s => s.id === value);
  const displayValue = selectedSpool ? selectedSpool.name : value;

  return (
    <>
      <div 
        className={`${className} flex items-center justify-between bg-white/50 dark:bg-slate-800/50 cursor-pointer`}
        onClick={() => {
          setIsOpen(true);
          setSearch('');
        }}
      >
        <span className="truncate pr-2">{displayValue || 'Select...'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 flex-shrink-0"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            >
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={() => setIsOpen(false)}
              ></div>
              
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-md flex flex-col relative z-10 max-h-[85vh]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </div>
                    Select Spool or Material
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                  placeholder="Search filaments or type custom name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2 space-y-4">
              {search && !filteredStandard.includes(search) && !filteredSpools.some(s => s.name === search) && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider pl-1">Custom</h3>
                  <div 
                    className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3"
                    onClick={() => {
                      onChange(undefined, search);
                      setIsOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300">Use custom: "{search}"</div>
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Create a material without tracking inventory</div>
                    </div>
                  </div>
                </div>
              )}
              
              {filteredSpools.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider pl-1">Inventory Spools</h3>
                  <div className="space-y-2">
                    {filteredSpools.map(spool => (
                      <div 
                        key={spool.id}
                        className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-white/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors flex items-center gap-3"
                        onClick={() => {
                          const costPerKg = spool.originalWeight ? spool.cost / (spool.originalWeight / 1000) : 0;
                          onChange(spool.id, `${spool.material} - ${spool.name}`, costPerKg);
                          setIsOpen(false);
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: spool.colorHex || '#cccccc' }}
                        ></div>
                        <div className="flex-1 truncate">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{spool.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{spool.material} • {spool.color} • {(spool.cost / (spool.originalWeight / 1000)).toFixed(2)}$/kg</div>
                        </div>
                        {spool.remainingWeight < 200 && (
                          <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md whitespace-nowrap">
                            Low ({spool.remainingWeight}g)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredStandard.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider pl-1">Standard Materials</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredStandard.map(type => (
                      <div 
                        key={type}
                        className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-white/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors text-center font-medium text-slate-700 dark:text-slate-200"
                        onClick={() => {
                          onChange(undefined, type);
                          setIsOpen(false);
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {filteredStandard.length === 0 && filteredSpools.length === 0 && !search && (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                  No materials found
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
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
