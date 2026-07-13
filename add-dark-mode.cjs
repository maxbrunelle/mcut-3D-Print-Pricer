const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const replacements = [
    { regex: /bg-white\/95/g, replace: 'bg-white/95 dark:bg-slate-900/95' },
    { regex: /bg-white\/80/g, replace: 'bg-white/80 dark:bg-slate-800/80' },
    { regex: /bg-white\/70/g, replace: 'bg-white/70 dark:bg-slate-800/70' },
    { regex: /bg-white\/60/g, replace: 'bg-white/60 dark:bg-slate-800/60' },
    { regex: /bg-white\/50/g, replace: 'bg-white/50 dark:bg-slate-800/50' },
    { regex: /bg-white\/40/g, replace: 'bg-white/40 dark:bg-slate-800/40' },
    { regex: /bg-white(?![\/\w])/g, replace: 'bg-white dark:bg-slate-800' },
    { regex: /border-white\/80/g, replace: 'border-white/80 dark:border-slate-700/80' },
    { regex: /border-white\/60/g, replace: 'border-white/60 dark:border-slate-700/60' },
    { regex: /border-white\/40/g, replace: 'border-white/40 dark:border-slate-700/40' },
    { regex: /text-slate-800/g, replace: 'text-slate-800 dark:text-slate-100' },
    { regex: /text-slate-700/g, replace: 'text-slate-700 dark:text-slate-200' },
    { regex: /text-slate-600/g, replace: 'text-slate-600 dark:text-slate-300' },
    { regex: /text-slate-500/g, replace: 'text-slate-500 dark:text-slate-400' },
    { regex: /text-slate-900/g, replace: 'text-slate-900 dark:text-slate-50' },
    { regex: /bg-slate-50(?![\/\w])/g, replace: 'bg-slate-50 dark:bg-slate-900' },
    { regex: /bg-slate-100(?![\/\w])/g, replace: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /bg-slate-200(?![\/\w])/g, replace: 'bg-slate-200 dark:bg-slate-700' },
    { regex: /bg-slate-800(?![\/\w])/g, replace: 'bg-slate-800 dark:bg-slate-100' },
    { regex: /bg-slate-900(?![\/\w])/g, replace: 'bg-slate-900 dark:bg-slate-200' },
    { regex: /border-slate-200/g, replace: 'border-slate-200 dark:border-slate-700' },
    { regex: /border-slate-300/g, replace: 'border-slate-300 dark:border-slate-600' },
    { regex: /hover:bg-slate-200/g, replace: 'hover:bg-slate-200 dark:hover:bg-slate-600' },
    { regex: /hover:bg-slate-100/g, replace: 'hover:bg-slate-100 dark:hover:bg-slate-700' },
    { regex: /hover:bg-slate-50/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800' },
    { regex: /hover:text-slate-800/g, replace: 'hover:text-slate-800 dark:hover:text-slate-100' },
    { regex: /hover:text-slate-900/g, replace: 'hover:text-slate-900 dark:hover:text-slate-50' },
  ];

  let modified = content;
  for (const r of replacements) {
    modified = modified.replace(r.regex, r.replace);
  }

  // De-duplicate if running multiple times accidentally
  modified = modified.replace(/(dark:[a-z0-9-\/]+)(?:\s+\1)+/g, '$1');

  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log('Modified', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('./src/components');
