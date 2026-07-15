const fs = require('fs');

const files = [
  'src/components/Dashboard.tsx',
  'src/components/InvoiceHistory.tsx',
  'src/components/JobScheduler.tsx',
  'src/components/SpoolInventory.tsx',
  'src/components/ExtraItemInventory.tsx',
  'src/components/PrinterManagement.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find "  return (\n"
  const returnIdx = content.indexOf('  return (\n');
  if (returnIdx === -1) continue;
  
  // We want to replace everything from `return (` to the end of the file.
  // Actually, we can just replace the start of the return.
  
  // Remove the `createPortal( <AnimatePresence> {isOpen && ( <motion.div fixed overlay> <motion.div dialog>`
  // But wait, the dialog is `<motion.div className="bg-white/90... w-full max-w-6xl h-[90vh] ...">`
  
  // Let's use regex to find the inner content
  const match = content.match(/<div className="flex justify-between items-center [^>]+>[\s\S]*?(?=\s*<\/motion\.div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>)/);
  if (!match) {
    console.log("No match for", file);
    continue;
  }
  
  // We need to keep the closing div of the dialog. Wait, `match[0]` doesn't include the closing tags.
  // Let's do this:
  // We know the dialog is the inner motion.div.
  // Let's replace the whole `return (` with just a `return (` that wraps the inner content.
  
  let inner = match[0];
  // Replace the closing button (the X button) in the header:
  inner = inner.replace(/<button[^>]+onClick=\{[^}]*setIsOpen\(false\)[^}]*\}[^>]*>[\s\S]*?<\/button>/, '');
  
  let newReturn = `  return (\n    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">\n      ${inner}\n    </div>\n  );\n}\n`;
  
  const newContent = content.substring(0, returnIdx) + newReturn;
  fs.writeFileSync(file, newContent);
  console.log("Rewrote", file);
}
