const fs = require('fs');
let code = fs.readFileSync('src/components/InvoiceHistory.tsx', 'utf8');

// Ensure delete button has shrink-0 and the title has break-words
code = code.replace(
  /<h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">/,
  '<h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight break-words min-w-0 flex-1">'
);

code = code.replace(
  /className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"/,
  'className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0"'
);

// For the bottom buttons, ensure they don't get squished by adding shrink-0 to them or they already have shrink-0 because their parent has shrink-0
// The parent has shrink-0 and flex-wrap, so they shouldn't squish.
// Let's also check if other text might overflow: `customerName`
code = code.replace(
  /<div className="text-xs font-medium px-2 py-0\.5 rounded-full bg-blue-100 text-blue-700 inline-block mb-2">/,
  '<div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 inline-block mb-2 break-all">'
);

fs.writeFileSync('src/components/InvoiceHistory.tsx', code);
