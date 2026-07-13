import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../lib/store';
import { Settings as SettingsIcon, Upload, X, Download, FileUp, Palette, Moon, Sun } from 'lucide-react';
import { THEMES } from '../App';

export function Settings() {
  const { state, updateState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const appLogoInputRef = useRef<HTMLInputElement>(null);
  const invoiceLogoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (type: 'appLogo' | 'invoiceLogo') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          updateState({ [type]: event.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (type: 'appLogo' | 'invoiceLogo') => {
    updateState({ [type]: null });
  };

  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `3d-pricer-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (window.confirm('Are you sure you want to restore this backup? This will overwrite all your current data.')) {
            updateState(parsed);
            alert('Backup restored successfully!');
          }
        } catch (err) {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:bg-slate-800/80 rounded-full transition-colors drop-shadow-sm border border-white/60 dark:border-slate-700/60"
        title="Settings"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 animate-in zoom-in-95 duration-300 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-2">
                <SettingsIcon size={24} className="text-blue-500" /> Settings
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* App Theme */}
              <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/60 dark:border-slate-700/60">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Palette size={16} /> Theme</h4>
                  <button
                    onClick={() => updateState({ isDarkMode: !state.isDarkMode })}
                    className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    {state.isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    {state.isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(THEMES).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => updateState({ appTheme: themeKey })}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${state.appTheme === themeKey ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/50 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${THEMES[themeKey].bg} opacity-80`} />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">{themeKey.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* App Logo */}
              <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/60 dark:border-slate-700/60">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">App Logo</h4>
                {state.appLogo ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={state.appLogo} alt="App Logo" className="h-16 object-contain" />
                    <button 
                      onClick={() => removeLogo('appLogo')}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => appLogoInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:bg-blue-900/50 transition-colors"
                  >
                    <Upload size={20} className="text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Upload App Logo</span>
                    <input 
                      type="file" 
                      ref={appLogoInputRef} 
                      className="hidden text-slate-800 dark:text-white" 
                      accept="image/*"
                      onChange={handleLogoUpload('appLogo')}
                    />
                  </div>
                )}
              </div>

              {/* Invoice Logo */}
              <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/60 dark:border-slate-700/60">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">Invoice Logo</h4>
                {state.invoiceLogo ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={state.invoiceLogo} alt="Invoice Logo" className="h-16 object-contain" />
                    <button 
                      onClick={() => removeLogo('invoiceLogo')}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => invoiceLogoInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:bg-blue-900/50 transition-colors"
                  >
                    <Upload size={20} className="text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Upload Invoice Logo</span>
                    <input 
                      type="file" 
                      ref={invoiceLogoInputRef} 
                      className="hidden text-slate-800 dark:text-white" 
                      accept="image/*"
                      onChange={handleLogoUpload('invoiceLogo')}
                    />
                  </div>
                )}
              </div>
              
              {/* Data Backup */}
              <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/60 dark:border-slate-700/60 mt-6">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">Data Backup</h4>
                <div className="flex gap-4">
                  <button
                    onClick={exportBackup}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl transition-colors text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <Download size={20} className="mb-2 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-medium">Export JSON</span>
                  </button>
                  <button
                    onClick={() => backupInputRef.current?.click()}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl transition-colors text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <FileUp size={20} className="mb-2 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-medium">Import JSON</span>
                  </button>
                  <input 
                    type="file" 
                    ref={backupInputRef} 
                    className="hidden text-slate-800 dark:text-white" 
                    accept=".json"
                    onChange={importBackup}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/40 dark:border-slate-700/40 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/60 dark:border-slate-700/60 shadow-[0_4px_12px_rgba(255,255,255,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-slate-800 dark:text-slate-100 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
