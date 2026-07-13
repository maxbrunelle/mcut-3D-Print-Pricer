const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // replace <input ... className="... text-slate-... " ... with dark:text-white
  // Wait, some inputs don't have text color at all.
  
  let modified = content;
  // Replace <input ... className="..." ...> to inject dark:text-white
  modified = modified.replace(/<input([^>]*?)className="([^"]+)"/g, (match, p1, p2) => {
    let classes = p2.split(' ');
    // remove existing text color classes
    classes = classes.filter(c => !c.match(/^text-slate-\d+$/) && !c.match(/^dark:text-slate-\d+$/) && !c.match(/^text-white$/) && !c.match(/^dark:text-white$/));
    classes.push('text-slate-800', 'dark:text-white');
    return `<input${p1}className="${classes.join(' ')}"`;
  });
  
  modified = modified.replace(/<textarea([^>]*?)className="([^"]+)"/g, (match, p1, p2) => {
    let classes = p2.split(' ');
    classes = classes.filter(c => !c.match(/^text-slate-\d+$/) && !c.match(/^dark:text-slate-\d+$/) && !c.match(/^text-white$/) && !c.match(/^dark:text-white$/));
    classes.push('text-slate-800', 'dark:text-white');
    return `<textarea${p1}className="${classes.join(' ')}"`;
  });
  
  // Also the <select> in InvoiceHistory.tsx
  modified = modified.replace(/<select([^>]*?)className="([^"]+)"/g, (match, p1, p2) => {
    let classes = p2.split(' ');
    classes = classes.filter(c => !c.match(/^text-slate-\d+$/) && !c.match(/^dark:text-slate-\d+$/) && !c.match(/^text-white$/) && !c.match(/^dark:text-white$/));
    classes.push('text-slate-800', 'dark:text-white');
    return `<select${p1}className="${classes.join(' ')}"`;
  });

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
