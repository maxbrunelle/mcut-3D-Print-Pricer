import React from 'react';
import { useAppContext } from '../lib/store';
import { InventoryAlerts } from './InventoryAlerts';
import { Settings } from './Settings';
import { motion } from 'motion/react';
import { 
  Calculator, 
  LayoutDashboard, 
  CalendarDays, 
  History, 
  Disc, 
  Box, 
  Printer,
  Moon,
  Sun,
  Users,
  Wrench,
  PenTool,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const { state, updateState } = useAppContext();
  const activeView = state.activeView || 'calculator';

    const menuItems = [
    { id: 'calculator', label: 'Quote', icon: Calculator },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scheduler', label: 'Job Scheduler', icon: CalendarDays },
    { id: 'history', label: 'Job Tracker', icon: History },
    { id: 'spools', label: 'Spools', icon: Disc },
    { id: 'items', label: 'Extra Items', icon: Box },
    { id: 'printers', label: 'Printers', icon: Printer },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Wrench },
    { id: 'services', label: 'CAD & Scanning', icon: PenTool },
  ];

  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`fixed md:static inset-y-0 left-0 w-64 h-full border-r border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 md:bg-white/70 md:dark:bg-slate-900/70 backdrop-blur-xl flex flex-col z-50 shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-3">
          {state.appLogo ? (
            <img src={state.appLogo} alt="App logo" className="max-h-12 object-contain drop-shadow-sm flex-1" />
          ) : (
            <img src="/mcut-logo.svg" alt="App logo" className="max-h-12 object-contain drop-shadow-sm flex-1" />
          )}
          
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => { updateState({ activeView: item.id as any }); if (onClose) onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} />
              {item.label}
              
              {/* Add badges if needed */}
              {item.id === 'history' && (state.invoices?.length > 0) && (
                <span className={`ml-auto text-[10px] py-0.5 px-2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {state.invoices.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1">
        <InventoryAlerts />
        <Settings />
      </div>
    </div>
    </>
  );
}
