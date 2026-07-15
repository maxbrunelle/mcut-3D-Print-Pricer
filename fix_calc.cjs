const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

// Add dueDate to initial state if it's missing (it's already in the types but we should just ensure it gets updated)
// Actually we can just add the input to the form.
const replacement = `            <input type="text" name="projectName" value={state.projectName} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" placeholder="e.g. Mechanical Keyboard Case" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Target Schedule Date
            </label>
            <input type="date" name="dueDate" value={state.dueDate || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
          </div>`;

code = code.replace(/<input type="text" name="projectName"[^>]*?>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/Calculator.tsx', code);
