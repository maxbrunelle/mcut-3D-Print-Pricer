import React from 'react';
import { Menu } from 'lucide-react';
import { useAppContext } from '../lib/store';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { state } = useAppContext();
  
  const activeViewLabel = {
    calculator: 'Quote',
    dashboard: 'Dashboard',
    scheduler: 'Job Scheduler',
    history: 'Job Tracker',
    spools: 'Spools',
    items: 'Extra Items',
    printers: 'Printers',
    customers: 'Customers'
  }[state.activeView || 'calculator'];

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2.5 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-3">
          {activeViewLabel}
          {state.editingInvoiceId && state.activeView === 'calculator' && (
            <span className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 tracking-normal uppercase">
              Editing Quote #{state.invoices?.find(i => i.id === state.editingInvoiceId)?.invoiceNumber || ''}
            </span>
          )}
        </h1>
      </div>
      
    </header>
  );
}
