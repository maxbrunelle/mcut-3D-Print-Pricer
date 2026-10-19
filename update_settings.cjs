const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const targetStr = `<h5 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">Pricing Defaults</h5>
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
                              </div>`;

const replacementStr = targetStr + `

                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 mt-6 mb-3 text-sm">CAD & Scanning Rates</h5>
                              <div className="space-y-3">
                                {state.inventoryDesignServices?.map(service => (
                                  <div key={service.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">{service.name} Rate (per hr)</label>
                                      <input 
                                        type="number" 
                                        min="0" step="1"
                                        value={service.pricePerHour}
                                        onChange={e => {
                                          const newServices = state.inventoryDesignServices?.map(s => 
                                            s.id === service.id ? { ...s, pricePerHour: parseFloat(e.target.value) || 0 } : s
                                          );
                                          updateState({ inventoryDesignServices: newServices });
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>`;

const idx = code.indexOf(targetStr);
if (idx !== -1) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/Settings.tsx', code);
  console.log("Updated Settings.tsx");
} else {
  console.log("Could not find target string.");
}
