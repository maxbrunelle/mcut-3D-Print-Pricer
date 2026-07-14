const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// add import
code = code.replace(
  "import { AnimatedNumber } from './AnimatedNumber';",
  "import { AnimatedNumber } from './AnimatedNumber';\nimport { ClientManagementContent } from './ClientManagement';"
);

// add activeTab state
code = code.replace(
  "const [isOpen, setIsOpen] = useState(false);",
  "const [isOpen, setIsOpen] = useState(false);\n  const [activeTab, setActiveTab] = useState<'analytics' | 'crm'>('analytics');"
);

// change the header to include tabs
const oldHeader = `<div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Business Analytics</h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </div>`;

const newHeader = `<div className="flex justify-between items-center mb-6">
                  <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 \${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      Analytics
                    </button>
                    <button
                      onClick={() => setActiveTab('crm')}
                      className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 \${activeTab === 'crm' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Clients / CRM
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </div>`;

code = code.replace(oldHeader, newHeader);

const oldContentStart = `<div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">`;
const newContentStart = `{activeTab === 'analytics' ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">`;

code = code.replace(oldContentStart, newContentStart);

const oldContentEnd = `              </div>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>`;

const newContentEnd = `              </div>
            ) : (
              <ClientManagementContent />
            )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>`;

code = code.replace(oldContentEnd, newContentEnd);

fs.writeFileSync('src/components/Dashboard.tsx', code);
