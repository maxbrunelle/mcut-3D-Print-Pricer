import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../lib/store';
import { Search, ChevronDown, Check } from 'lucide-react';

interface CustomerSelectProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onChange: (id: string) => void;
}

export function CustomerSelect({ customers, selectedCustomerId, onChange }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(searchLower);
    const numMatch = c.clientNumber?.includes(searchTerm);
    return nameMatch || numMatch;
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:bg-white/70 dark:bg-slate-800/70 transition-all duration-300 cursor-pointer flex justify-between items-center"
      >
        <span className={selectedCustomer ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
          {selectedCustomer ? `${selectedCustomer.clientNumber ? `#${selectedCustomer.clientNumber} - ` : ''}${selectedCustomer.name}` : 'Select a customer (Optional)'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm text-slate-700 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${!selectedCustomerId ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-white'}`}
            >
              <span>None</span>
              {!selectedCustomerId && <Check size={16} className="text-blue-600" />}
            </div>
            {filteredCustomers.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">No customers found</div>
            ) : (
              filteredCustomers.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${selectedCustomerId === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-white'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    {c.clientNumber && <span className="text-xs opacity-70">#{c.clientNumber}</span>}
                  </div>
                  {selectedCustomerId === c.id && <Check size={16} className="text-blue-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
