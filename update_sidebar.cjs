const fs = require('fs');

let sidebarCode = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add imports
if (!sidebarCode.includes('InventoryAlerts')) {
  sidebarCode = sidebarCode.replace(
    /import \{ useAppContext \} from '\.\.\/lib\/store';/,
    "import { useAppContext } from '../lib/store';\nimport { InventoryAlerts } from './InventoryAlerts';\nimport { Settings } from './Settings';"
  );
}

// Replace the lower section
const lowerSection = `<div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1">
        <InventoryAlerts />
        <Settings />
      </div>`;

sidebarCode = sidebarCode.replace(
  /<div className="p-4 border-t border-slate-200\/50 dark:border-slate-700\/50 flex flex-col gap-3">[\s\S]*?<div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">\s*v1\.0\.0\s*<\/div>\s*<\/div>/,
  lowerSection
);

fs.writeFileSync('src/components/Sidebar.tsx', sidebarCode);
