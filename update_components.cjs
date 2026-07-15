const fs = require('fs');

let settingsCode = fs.readFileSync('src/components/Settings.tsx', 'utf8');
settingsCode = settingsCode.replace(
  /<button \n\s*onClick=\{\(\) => setIsOpen\(true\)\}\n\s*className="p-2 text-slate-500.*?<\/button>/,
  `<button 
        onClick={() => setIsOpen(true)}
        className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
        title="Settings"
      >
        <SettingsIcon size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        Settings
      </button>`
);
fs.writeFileSync('src/components/Settings.tsx', settingsCode);

let inventoryCode = fs.readFileSync('src/components/InventoryAlerts.tsx', 'utf8');
inventoryCode = inventoryCode.replace(
  /<button \n\s*onClick=\{handleOpen\}\n\s*className="relative text-slate-500.*?<\/button>/,
  `<button 
        onClick={handleOpen}
        className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
          {unviewedCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          )}
        </div>
        Notifications
        {unviewedCount > 0 && (
          <span className="ml-auto text-[10px] py-0.5 px-2 rounded-full font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {unviewedCount}
          </span>
        )}
      </button>`
);
fs.writeFileSync('src/components/InventoryAlerts.tsx', inventoryCode);

