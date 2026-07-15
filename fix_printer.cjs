const fs = require('fs');
let code = fs.readFileSync('src/components/PrinterManagement.tsx', 'utf8');

// The `code` starts with the `return (` block. We need to wrap it correctly.
const startIdx = code.indexOf('<div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">');

const header = `  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <h2 className="text-xl font-bold uppercase tracking-widest">Printer Management</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* LEFT PANE */}
        <div className="col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6 flex flex-col h-full overflow-hidden">
          <button 
            onClick={() => handleOpenForm()} 
            className="w-full mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl border border-blue-200 dark:border-blue-800/30 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Printer
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {printers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                No printers added yet.
              </div>
            ) : (
              printers.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleOpenForm(p)}
                  className={\`p-3 rounded-xl cursor-pointer transition-all border \${editingPrinterId === p.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600'}\`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                    <span>{p.model}</span>
                    <button onClick={(e) => handleDeletePrinter(p.id, e)} className="text-red-400 hover:text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* RIGHT PANE */}
        <div className="col-span-1 md:col-span-2 flex flex-col h-full">
          {(editingPrinterId || isAdding) ? (
            <div className="flex flex-col flex-1 h-full">
`;

const footer = `
          )}
        </div>
      </div>
    </div>
  );
}
`;

let rightPaneContent = code.substring(startIdx, code.lastIndexOf('</div>') - 20); // roughly trim the end

// Let's make it simpler, we just find the end of the `) : (` block which is the `Select a printer` div.
const emptyStateStr = `<p>Select a printer to edit or add a new one.</p>`;
const emptyStateIdx = code.indexOf(emptyStateStr);
let rightPane = code.substring(startIdx, emptyStateIdx + emptyStateStr.length + 30); // get up to `</div>`

// Strip the end of the file.
fs.writeFileSync('src/components/PrinterManagement.tsx', code.substring(0, startIdx - 150) + header + rightPane + footer);

