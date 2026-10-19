const fs = require('fs');
let code = fs.readFileSync('src/components/SpoolInventory.tsx', 'utf8');

const oldHeaderRegex = /<div className="flex flex-wrap justify-between items-center mb-6 gap-4">\s*<div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">\s*<svg[^>]*>.*?<\/svg>\s*<h2[^>]*>Spool Inventory<\/h2>\s*<\/div>\s*<\/div>/g;

const newHeader = `<div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Spool Inventory</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input
                        type="search"
                        placeholder="Search spools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-sm text-slate-800 dark:text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700/50 shrink-0">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={\`p-1.5 rounded-md transition-all \${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                        title="Grid View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={\`p-1.5 rounded-md transition-all \${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                        title="List View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
              </div>`;

if (code.match(oldHeaderRegex)) {
    code = code.replace(oldHeaderRegex, newHeader);
    fs.writeFileSync('src/components/SpoolInventory.tsx', code);
    console.log('Fixed header');
} else {
    console.log('Could not match header');
}
