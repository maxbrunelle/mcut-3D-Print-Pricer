const fs = require('fs');
let code = fs.readFileSync('src/components/PrinterManagement.tsx', 'utf8');

// The issue is `rgb  return (`. We can just replace it.
code = code.replace(/<div className="bg-white\/95[^>]*?rgb  return \(\n    <div className="bg-white\/95/g, 'return (\n    <div className="bg-white/95');
// Wait, the safest way is to just find `return (` and replace the first one to the second one.

const firstReturn = code.indexOf('  return (\n');
const secondReturn = code.indexOf('  return (\n', firstReturn + 1);

if (secondReturn !== -1) {
    code = code.substring(0, firstReturn) + code.substring(secondReturn);
}

fs.writeFileSync('src/components/PrinterManagement.tsx', code);
