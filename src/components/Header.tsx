import React from 'react';
import { useAppContext } from '../lib/store';
import { Settings } from './Settings';
import { InventoryAlerts } from './InventoryAlerts';

export function Header() {
  const { state } = useAppContext();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {state.appLogo ? (
          <img src={state.appLogo} alt="App logo" className="h-10 object-contain drop-shadow-sm" />
        ) : (
          <img src="/mcut-logo.svg" alt="mcut logo" className="h-10 object-contain drop-shadow-sm" />
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm border-l-2 border-slate-300 dark:border-slate-600 pl-4 flex items-center gap-3">
          3D Print Pricer
          {state.editingInvoiceId && (
            <span className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 tracking-normal uppercase">
              Editing Quote #{state.invoices?.find(i => i.id === state.editingInvoiceId)?.invoiceNumber || ''}
            </span>
          )}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <InventoryAlerts />
        <Settings />
      </div>
    </header>
  );
}
