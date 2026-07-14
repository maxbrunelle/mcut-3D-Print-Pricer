const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

// The manage customers modal starts with showManageCustomersModal
const startStr = "{showManageCustomersModal && (";
const endStr = "          )}";

const parts = code.split("{showManageCustomersModal && (");
if (parts.length > 1) {
    const after = parts[1];
    const matchEnd = after.indexOf("          )}");
    if (matchEnd !== -1) {
        // the end of the block is around there...
        // actually let's just use a regex
    }
}

