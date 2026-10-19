const fs = require('fs');
let code = fs.readFileSync('src/components/JobScheduler.tsx', 'utf8');

code = code.replace(/updateState\(\{\s*inspectingInvoiceId:\s*([^)]+)\)/g, "updateState({ inspectingInvoiceId: $1 })");

fs.writeFileSync('src/components/JobScheduler.tsx', code);
console.log("Fixed scheduler syntax error");
