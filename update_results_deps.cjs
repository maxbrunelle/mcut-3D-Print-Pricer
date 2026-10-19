const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

code = code.replace("    state.extraItems,", "    state.extraItems,\n    state.designTasks,");

fs.writeFileSync('src/components/Results.tsx', code);
console.log("Updated Results.tsx deps");
