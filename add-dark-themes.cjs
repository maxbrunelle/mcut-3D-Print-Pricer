const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/'from-indigo-100 via-cyan-100 to-purple-100'/g, "'from-indigo-100 via-cyan-100 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'");
content = content.replace(/'bg-cyan-300\/30'/g, "'bg-cyan-300/30 dark:bg-cyan-900/30'");
content = content.replace(/'bg-purple-300\/30'/g, "'bg-purple-300/30 dark:bg-purple-900/30'");
content = content.replace(/'bg-blue-300\/30'/g, "'bg-blue-300/30 dark:bg-blue-900/30'");

content = content.replace(/'from-rose-100 via-orange-100 to-pink-100'/g, "'from-rose-100 via-orange-100 to-pink-100 dark:from-stone-900 dark:via-neutral-800 dark:to-stone-900'");
content = content.replace(/'bg-orange-300\/30'/g, "'bg-orange-300/30 dark:bg-orange-900/30'");
content = content.replace(/'bg-rose-300\/30'/g, "'bg-rose-300/30 dark:bg-rose-900/30'");
content = content.replace(/'bg-yellow-300\/30'/g, "'bg-yellow-300/30 dark:bg-yellow-900/30'");

content = content.replace(/'from-emerald-100 via-teal-100 to-cyan-100'/g, "'from-emerald-100 via-teal-100 to-cyan-100 dark:from-teal-900 dark:via-slate-800 dark:to-teal-900'");
content = content.replace(/'bg-teal-300\/30'/g, "'bg-teal-300/30 dark:bg-teal-900/30'");
content = content.replace(/'bg-emerald-300\/30'/g, "'bg-emerald-300/30 dark:bg-emerald-900/30'");

content = content.replace(/'from-slate-100 via-gray-100 to-zinc-100'/g, "'from-slate-100 via-gray-100 to-zinc-100 dark:from-slate-950 dark:via-gray-900 dark:to-zinc-950'");
content = content.replace(/'bg-slate-300\/20'/g, "'bg-slate-300/20 dark:bg-slate-700/20'");
content = content.replace(/'bg-gray-300\/20'/g, "'bg-gray-300/20 dark:bg-gray-700/20'");
content = content.replace(/'bg-zinc-300\/20'/g, "'bg-zinc-300/20 dark:bg-zinc-700/20'");

content = content.replace(/'from-fuchsia-100 via-purple-100 to-pink-100'/g, "'from-fuchsia-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900'");
content = content.replace(/'bg-fuchsia-300\/30'/g, "'bg-fuchsia-300/30 dark:bg-fuchsia-900/30'");
content = content.replace(/'bg-pink-300\/30'/g, "'bg-pink-300/30 dark:bg-pink-900/30'");

fs.writeFileSync('src/App.tsx', content, 'utf8');
