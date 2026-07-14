const fs = require('fs');
let code = fs.readFileSync('src/components/InvoiceHistory.tsx', 'utf8');

code = code.replace(
  'const handleEditJob = (inv: typeof invoices[0], e: React.MouseEvent) => {',
  `const handleEditJob = (inv: typeof invoices[0], e: React.MouseEvent) => {
    console.log("Edit Job clicked", inv);`
);

fs.writeFileSync('src/components/InvoiceHistory.tsx', code);
