const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const tableSubtotalOld = `const tableSubtotal = state.isInHouseJob ? 0 : subtotalRaw + extraItemsTotal;`;
const tableSubtotalNew = `const tableSubtotal = state.isInHouseJob ? 0 : subtotalRaw + extraItemsTotal + designTasksTotal;`;
code = code.replace(tableSubtotalOld, tableSubtotalNew);

fs.writeFileSync('src/components/Results.tsx', code);
console.log("Updated tableSubtotal in Results.tsx");
