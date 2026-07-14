import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../lib/store';
import { Settings as SettingsIcon, Upload, X, Download, FileUp, Palette, Moon, Sun, Activity, Database, Image as ImageIcon, Briefcase, Sliders } from 'lucide-react';
import { THEMES } from '../App';
import { motion, AnimatePresence } from 'motion/react';

export function Settings() {
  const { state, updateState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'defaults' | 'appearance' | 'animations' | 'data'>('business');
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

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-0 w-full max-w-4xl h-[700px] max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              >
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700/50 p-6 flex flex-col flex-shrink-0">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-2">
                      <SettingsIcon size={24} className="text-blue-500" /> Settings
                    </h3>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-700/50"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
                    <button
                      onClick={() => setActiveTab('business')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                        activeTab === 'business' 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Briefcase size={18} /> Business Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('defaults')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                        activeTab === 'defaults' 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Sliders size={18} /> Defaults & Pricing
                    </button>
                    <button
                      onClick={() => setActiveTab('appearance')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                        activeTab === 'appearance' 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Palette size={18} /> Appearance
                    </button>
                    <button
                      onClick={() => setActiveTab('animations')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                        activeTab === 'animations' 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Activity size={18} /> Animations
                    </button>
                    <button
                      onClick={() => setActiveTab('data')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                        activeTab === 'data' 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Database size={18} /> Data Backup
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col relative">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="hidden md:block absolute top-6 right-6 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50 z-10"
                  >
                    <X size={20} />
                  </button>

                  <div className="max-w-2xl">
                    {activeTab === 'business' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-500" /> Business Profile
                          </h4>
                          <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Company Name</label>
                              <input 
                                type="text" 
                                value={state.companyName || ''}
                                onChange={e => updateState({ companyName: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                placeholder="e.g. Acme 3D Printing"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Company Address</label>
                              <textarea 
                                value={state.companyAddress || ''}
                                onChange={e => updateState({ companyAddress: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm h-20 resize-none custom-scrollbar"
                                placeholder="123 Main St, City, Country"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Email Address</label>
                                <input 
                                  type="email" 
                                  value={state.companyEmail || ''}
                                  onChange={e => updateState({ companyEmail: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  placeholder="contact@example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Phone Number</label>
                                <input 
                                  type="text" 
                                  value={state.companyPhone || ''}
                                  onChange={e => updateState({ companyPhone: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  placeholder="+1 (555) 123-4567"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Website URL</label>
                              <input 
                                type="url" 
                                value={state.companyWebsite || ''}
                                onChange={e => updateState({ companyWebsite: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                placeholder="https://www.example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'defaults' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Sliders size={20} className="text-blue-500" /> Defaults & Formatting
                          </h4>
                          <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Currency</label>
                                <select 
                                  value={state.currency || 'USD'}
                                  onChange={e => updateState({ currency: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                >
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="CAD">CAD ($)</option>
                                  <option value="AUD">AUD ($)</option>
                                  <option value="JPY">JPY (¥)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Date Format</label>
                                <select 
                                  value={state.dateFormat || 'MM/DD/YYYY'}
                                  onChange={e => updateState({ dateFormat: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                >
                                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                              </div>
                            </div>

                            <div className="pt-2">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Invoice Defaults</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Default GST/VAT Rate (%)</label>
                                  <input 
                                    type="number" 
                                    min="0" step="0.1"
                                    value={state.gstRate}
                                    onChange={e => updateState({ gstRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Default QST/State Rate (%)</label>
                                  <input 
                                    type="number" 
                                    min="0" step="0.1"
                                    value={state.qstRate}
                                    onChange={e => updateState({ qstRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Pricing Defaults</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Default Labor Rate (per hr)</label>
                                  <input 
                                    type="number" 
                                    min="0" step="1"
                                    value={state.laborRatePerHour}
                                    onChange={e => updateState({ laborRatePerHour: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Default Failure Rate (%)</label>
                                  <input 
                                    type="number" 
                                    min="0" max="100" step="1"
                                    value={state.failureRate}
                                    onChange={e => updateState({ failureRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-blue-500" /> Theme Configuration
                          </h4>
                          <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                              <div>
                                <h5 className="font-semibold text-slate-700 dark:text-slate-200">Color Mode</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark environments.</p>
                              </div>
                              <button
                                onClick={() => updateState({ isDarkMode: !state.isDarkMode })}
                                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              >
                                {state.isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                                {state.isDarkMode ? 'Light Mode' : 'Dark Mode'}
                              </button>
                            </div>
                            
                            <div className="h-px bg-slate-200 dark:bg-slate-700 mb-6 w-full" />
                            
                            <div>
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Color Palette</h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.keys(THEMES).map((themeKey) => (
                                  <button
                                    key={themeKey}
                                    onClick={() => updateState({ appTheme: themeKey })}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${state.appTheme === themeKey ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm'}`}
                                  >
                                    <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${THEMES[themeKey].bg} opacity-90 shadow-inner`} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wide">{themeKey.replace('-', ' ')}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-blue-500" /> Branding
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* App Logo */}
                            <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm flex flex-col">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">App Logo</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Displayed in the header</p>
                              
                              <div className="flex-1 flex flex-col justify-center">
                                {state.appLogo ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="h-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900 w-full rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                                      <img src={state.appLogo} alt="App Logo" className="max-h-full object-contain" />
                                    </div>
                                    <button 
                                      onClick={() => removeLogo('appLogo')}
                                      className="text-xs px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg font-medium transition-colors w-full"
                                    >
                                      Remove Logo
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => appLogoInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors h-full"
                                  >
                                    <Upload size={24} className="text-slate-400 mb-3" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Upload Logo</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center">PNG, JPG, SVG up to 2MB</span>
                                    <input 
                                      type="file" 
                                      ref={appLogoInputRef} 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleLogoUpload('appLogo')}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Invoice Logo */}
                            <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm flex flex-col">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Invoice Logo</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Displayed on generated PDFs</p>
                              
                              <div className="flex-1 flex flex-col justify-center">
                                {state.invoiceLogo ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="h-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900 w-full rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                                      <img src={state.invoiceLogo} alt="Invoice Logo" className="max-h-full object-contain" />
                                    </div>
                                    <button 
                                      onClick={() => removeLogo('invoiceLogo')}
                                      className="text-xs px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg font-medium transition-colors w-full"
                                    >
                                      Remove Logo
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => invoiceLogoInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors h-full"
                                  >
                                    <Upload size={24} className="text-slate-400 mb-3" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Upload Logo</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center">PNG, JPG, SVG up to 2MB</span>
                                    <input 
                                      type="file" 
                                      ref={invoiceLogoInputRef} 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleLogoUpload('invoiceLogo')}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'animations' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                          <Activity size={20} className="text-blue-500" /> Interface Animations
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                          Customize how the interface moves and responds to your interactions. Disabling animations can improve performance on older devices.
                        </p>

                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                            <div>
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200">Popups & Modals</h5>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enable scale and fade effects when opening dialogs.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={state.animationsEnabled?.popups ?? true}
                                onChange={(e) => updateState({ animationsEnabled: { ...state.animationsEnabled, popups: e.target.checked } })}
                              />
                              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 shadow-inner"></div>
                            </label>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                            <div>
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200">Animated Numbers</h5>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Animate numbers counting up or down when values change.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={state.animationsEnabled?.numbers ?? true}
                                onChange={(e) => updateState({ animationsEnabled: { ...state.animationsEnabled, numbers: e.target.checked } })}
                              />
                              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 shadow-inner"></div>
                            </label>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                            <div>
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200">Fluid Layouts</h5>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Animate structural changes like adding or removing items.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={state.animationsEnabled?.layouts ?? true}
                                onChange={(e) => updateState({ animationsEnabled: { ...state.animationsEnabled, layouts: e.target.checked } })}
                              />
                              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 shadow-inner"></div>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'data' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                          <Database size={20} className="text-blue-500" /> Data Management
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                          Backup your complete database to a local file, or restore from a previous backup.
                        </p>

                        <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-white/80 dark:border-slate-700/80 shadow-sm">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button
                              onClick={exportBackup}
                              className="flex-1 flex flex-col items-center justify-center py-8 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-800 rounded-xl transition-colors group"
                            >
                              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Download size={24} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-bold text-blue-700 dark:text-blue-300">Export Backup</span>
                              <span className="text-xs text-blue-500/70 dark:text-blue-400/70 mt-1">Save data as JSON</span>
                            </button>
                            
                            <button
                              onClick={() => backupInputRef.current?.click()}
                              className="flex-1 flex flex-col items-center justify-center py-8 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors group"
                            >
                              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileUp size={24} className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="font-bold text-emerald-700 dark:text-emerald-300">Import Backup</span>
                              <span className="text-xs text-emerald-500/70 dark:text-emerald-400/70 mt-1">Restore from JSON</span>
                            </button>
                            <input 
                              type="file" 
                              ref={backupInputRef} 
                              className="hidden" 
                              accept=".json"
                              onChange={importBackup}
                            />
                          </div>
                          
                          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <h5 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Warning about importing</h5>
                            <p className="text-xs text-amber-700 dark:text-amber-500">
                              Importing a backup will completely overwrite your current data. Make sure you export a backup of your current state first if you want to keep it.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
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
