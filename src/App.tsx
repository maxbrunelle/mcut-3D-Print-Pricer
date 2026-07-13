import React from 'react';
import { AppProvider, useAppContext } from './lib/store';
import { Calculator } from './components/Calculator';
import { Results } from './components/Results';
import { InvoiceHistory } from './components/InvoiceHistory';
import { SpoolInventory } from './components/SpoolInventory';
import { ExtraItemInventory } from './components/ExtraItemInventory';
import { Dashboard } from './components/Dashboard';
import { InstallPWA } from './components/InstallPWA';
import { Header } from './components/Header';

export const THEMES: Record<string, { bg: string, blob1: string, blob2: string, blob3: string }> = {
  'indigo-cyan': {
    bg: 'from-indigo-100 via-cyan-100 to-purple-100',
    blob1: 'bg-cyan-300/30',
    blob2: 'bg-purple-300/30',
    blob3: 'bg-blue-300/30',
  },
  'sunset-rose': {
    bg: 'from-rose-100 via-orange-100 to-pink-100',
    blob1: 'bg-orange-300/30',
    blob2: 'bg-rose-300/30',
    blob3: 'bg-yellow-300/30',
  },
  'emerald-mint': {
    bg: 'from-emerald-100 via-teal-100 to-cyan-100',
    blob1: 'bg-teal-300/30',
    blob2: 'bg-emerald-300/30',
    blob3: 'bg-cyan-300/30',
  },
  'slate-minimal': {
    bg: 'from-slate-100 via-gray-100 to-zinc-100',
    blob1: 'bg-slate-300/20',
    blob2: 'bg-gray-300/20',
    blob3: 'bg-zinc-300/20',
  },
  'lavender-blush': {
    bg: 'from-fuchsia-100 via-purple-100 to-pink-100',
    blob1: 'bg-purple-300/30',
    blob2: 'bg-fuchsia-300/30',
    blob3: 'bg-pink-300/30',
  }
};

function AppContent() {
  const { state } = useAppContext();
  const theme = THEMES[state.appTheme] || THEMES['indigo-cyan'];

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans bg-gradient-to-br ${theme.bg} relative overflow-hidden transition-colors duration-1000`}>
      {/* Animated ambient background blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full ${theme.blob1} blur-3xl mix-blend-multiply transition-colors duration-1000`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ${theme.blob2} blur-3xl mix-blend-multiply transition-colors duration-1000`}></div>
      <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full ${theme.blob3} blur-3xl mix-blend-multiply transition-colors duration-1000`}></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Header />

        <div className="mb-8 flex flex-wrap gap-4">
          <InvoiceHistory />
          <SpoolInventory /><ExtraItemInventory />
          <Dashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <Calculator />
          </div>

          <div className="lg:col-span-5">
            <Results />
          </div>
        </div>
      </div>
      <InstallPWA />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

