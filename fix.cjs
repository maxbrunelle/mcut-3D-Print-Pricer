const fs = require('fs');

// Fix PrinterManagement.tsx
let p = fs.readFileSync('src/components/PrinterManagement.tsx', 'utf8');
// The issue might be that a closing parenthesis was removed.
p += '  )\n';
fs.writeFileSync('src/components/PrinterManagement.tsx', p);

// Fix JobScheduler.tsx
let j = fs.readFileSync('src/components/JobScheduler.tsx', 'utf8');
// It says Expected `)` but found `EOF` at 382:3
if (j.trim().endsWith('}')) {
    // probably needs );
    j = j.substring(0, j.lastIndexOf('}')) + '  );\n}';
    fs.writeFileSync('src/components/JobScheduler.tsx', j);
}

