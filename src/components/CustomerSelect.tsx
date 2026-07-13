import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Customer } from '../lib/store';

interface CustomerSelectProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onChange: (id: string) => void;
}

export function CustomerSelect({ customers, selectedCustomerId, onChange }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(searchLower);
    const numMatch = c.clientNumber?.includes(searchTerm);
    return nameMatch || numMatch;
  });

  return (
    <>
      <div 
        onClick={() => {
          setIsOpen(true);
          setSearchTerm('');
        }}
        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer flex justify-between items-center"
      >
        <span className={selectedCustomer ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
          {selectedCustomer ? `${selectedCustomer.clientNumber ? `#${selectedCustomer.clientNumber} - ` : ''}${selectedCustomer.name}` : 'Select a customer (Optional)'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-md flex flex-col relative z-10 animate-in zoom-in-95 duration-300 max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                Select a Customer
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
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2 space-y-2">
              <div
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${!selectedCustomerId ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-white/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200'}`}
              >
                <div className="font-medium">None</div>
                {!selectedCustomerId && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="19" x2="5" y1="12" y2="12"/></svg>
                  No customers found
                </div>
              ) : (
                filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onChange(c.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${selectedCustomerId === c.id ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-white/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200'}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      {c.clientNumber && <span className="text-xs opacity-70">#{c.clientNumber}</span>}
                    </div>
                    {selectedCustomerId === c.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                ))
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
