const fs = require('fs');
let code = fs.readFileSync('src/components/ClientManagement.tsx', 'utf8');

// replace "export function ClientManagement() {" with "export function ClientManagementContent() {"
code = code.replace("export function ClientManagement() {", "export function ClientManagementContent() {");

// remove the button and modal wrappers
const startReplace = `  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 backdrop-blur-xl border border-white/60 dark:border-slate-600/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Clients / CRM
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0, y: 20 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1, y: 0 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0, y: 20 } : false}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-6xl max-h-[90vh] flex flex-col relative z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm">Client Management (CRM)</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>`;
const endReplace = `              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );`;
code = code.replace(startReplace, 'return (\n<div className="flex-1 overflow-hidden flex flex-col h-full">');
code = code.replace(endReplace, '</div>\n  );');
code = code.replace("const [isOpen, setIsOpen] = useState(false);", "");

fs.writeFileSync('src/components/ClientManagement.tsx', code);
