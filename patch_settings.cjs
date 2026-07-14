const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const regexInvoiceDefaults = /<h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Invoice Defaults<\/h5>([\s\S]*?)<\/div>\n                            <\/div>/;

const insertInvoiceCustomization = `<h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Invoice Defaults</h5>$1</div>
                            </div>
                            
                            <div className="pt-2">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Invoice Customization (PDF)</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      checked={state.invoicePreferences?.showTaxPercentages !== false}
                                      onChange={e => updateState({ invoicePreferences: { ...state.invoicePreferences, showTaxPercentages: e.target.checked } })}
                                      className="sr-only text-slate-800 dark:text-white"
                                    />
                                    <div className={\`block w-10 h-6 rounded-full transition-colors \${state.invoicePreferences?.showTaxPercentages !== false ? 'bg-blue-500' : 'bg-slate-300'}\`}></div>
                                    <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${state.invoicePreferences?.showTaxPercentages !== false ? 'translate-x-4' : ''}\`}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Tax Percentages</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      checked={state.invoicePreferences?.showBusinessAddress !== false}
                                      onChange={e => updateState({ invoicePreferences: { ...state.invoicePreferences, showBusinessAddress: e.target.checked } })}
                                      className="sr-only text-slate-800 dark:text-white"
                                    />
                                    <div className={\`block w-10 h-6 rounded-full transition-colors \${state.invoicePreferences?.showBusinessAddress !== false ? 'bg-blue-500' : 'bg-slate-300'}\`}></div>
                                    <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${state.invoicePreferences?.showBusinessAddress !== false ? 'translate-x-4' : ''}\`}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Business Address</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      checked={state.invoicePreferences?.showMaterialBreakdown !== false}
                                      onChange={e => updateState({ invoicePreferences: { ...state.invoicePreferences, showMaterialBreakdown: e.target.checked } })}
                                      className="sr-only text-slate-800 dark:text-white"
                                    />
                                    <div className={\`block w-10 h-6 rounded-full transition-colors \${state.invoicePreferences?.showMaterialBreakdown !== false ? 'bg-blue-500' : 'bg-slate-300'}\`}></div>
                                    <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${state.invoicePreferences?.showMaterialBreakdown !== false ? 'translate-x-4' : ''}\`}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Material Breakdown</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      checked={state.invoicePreferences?.showPrintTime !== false}
                                      onChange={e => updateState({ invoicePreferences: { ...state.invoicePreferences, showPrintTime: e.target.checked } })}
                                      className="sr-only text-slate-800 dark:text-white"
                                    />
                                    <div className={\`block w-10 h-6 rounded-full transition-colors \${state.invoicePreferences?.showPrintTime !== false ? 'bg-blue-500' : 'bg-slate-300'}\`}></div>
                                    <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${state.invoicePreferences?.showPrintTime !== false ? 'translate-x-4' : ''}\`}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Print Time</span>
                                </label>
                              </div>
                            </div>`;

code = code.replace(regexInvoiceDefaults, insertInvoiceCustomization);

fs.writeFileSync('src/components/Settings.tsx', code);
