const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

code = code.replace(/<button \n                  onClick=\{.*?setShowManageCustomersModal\(true\)\}\n                  className="text-xs text-slate-600 dark:text-slate-300 font-medium hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 flex items-center gap-1 transition-colors"\n                >\n                  <svg.*?<\/svg>\n                  Manage\n                <\/button>/s, '');

fs.writeFileSync('src/components/Calculator.tsx', code);
