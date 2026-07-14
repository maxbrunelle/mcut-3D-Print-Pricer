const fs = require('fs');
let code = fs.readFileSync('src/lib/store.tsx', 'utf8');

const regexState = /export interface CalculatorState \{([\s\S]*?)animationsEnabled:/;
const insertState = `export interface InvoicePreferences {
  showTaxPercentages: boolean;
  showBusinessAddress: boolean;
  showMaterialBreakdown: boolean;
  showPrintTime: boolean;
}

export interface CalculatorState {$1invoicePreferences?: InvoicePreferences;\n  animationsEnabled:`;

code = code.replace(regexState, insertState);

const regexDefaultState = /animationsEnabled: \{([\s\S]*?)\}/;
const insertDefaultState = `animationsEnabled: {$1},\n  invoicePreferences: {
    showTaxPercentages: true,
    showBusinessAddress: true,
    showMaterialBreakdown: true,
    showPrintTime: true,
  }`;

code = code.replace(regexDefaultState, insertDefaultState);

fs.writeFileSync('src/lib/store.tsx', code);
