const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add import Moon, Sun
code = code.replace(/Printer\n} from 'lucide-react';/, "Printer,\n  Moon,\n  Sun\n} from 'lucide-react';");

const toggleUI = `      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-3">
        <button 
          onClick={() => updateState({ isDarkMode: !state.isDarkMode })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
        >
          {state.isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-500" />}
          {state.isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
          v1.0.0
        </div>
      </div>`;

code = code.replace(/<div className="p-4 border-t border-slate-200\/50 dark:border-slate-700\/50">[\s\S]*?<\/div>\n      <\/div>/, toggleUI + '\n    </div>');

fs.writeFileSync('src/components/Sidebar.tsx', code);
