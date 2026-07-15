const fs = require('fs');

let code = fs.readFileSync('src/components/JobScheduler.tsx', 'utf8');

const partsSection = `
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <PrinterIcon size={16} className="text-slate-500" />
                Parts & Requirements
              </h4>
              <div className="space-y-2">
                {invoice.savedState?.parts?.map((p: any) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {p.is3DPrinted !== false ? \`3D Print \${p.printTimeHrs || 0}h \${p.printTimeMin || 0}m \` : 'Extra Item'}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      x{p.quantity || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
`;

code = code.replace(/<div>\s*<h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">\s*<Clock size=\{16\} className="text-slate-500" \/>\s*Scheduled Jobs for this Order\s*<\/h4>/, 
partsSection + `\n            <div>\n              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">\n                <Clock size={16} className="text-slate-500" />\n                Scheduled Jobs for this Order\n              </h4>`);

fs.writeFileSync('src/components/JobScheduler.tsx', code);
