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
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm border-l-2 border-slate-300 dark:border-slate-600 pl-4">3D Print Pricer</h1>
      </div>
      <div className="flex items-center gap-3">
        <InventoryAlerts />
        <Settings />
      </div>
    </header>
  );
}
