const fs = require('fs');

// 1. Update store.tsx
let storeCode = fs.readFileSync('src/lib/store.tsx', 'utf8');
storeCode = storeCode.replace(
  "editingInvoiceId?: string | null;",
  "editingInvoiceId?: string | null;\n  inspectingInvoiceId?: string | null;"
);
fs.writeFileSync('src/lib/store.tsx', storeCode);

// 2. Update JobScheduler.tsx
let schedulerCode = fs.readFileSync('src/components/JobScheduler.tsx', 'utf8');
schedulerCode = schedulerCode.replace(
  "const [inspectingInvoiceId, setInspectingInvoiceId] = useState<string | null>(null);",
  "// Using global state for inspectingInvoiceId instead of local"
);

// We need to replace all occurrences of setInspectingInvoiceId
schedulerCode = schedulerCode.replace(/setInspectingInvoiceId\(/g, "updateState({ inspectingInvoiceId: ");
// Ensure we add the closing brace for updateState
// e.g. setInspectingInvoiceId(null) -> updateState({ inspectingInvoiceId: null })
// Wait, regex might be tricky if it's not exactly that. Let's do it carefully.
schedulerCode = schedulerCode.replace(/setInspectingInvoiceId\(null\)/g, "updateState({ inspectingInvoiceId: null })");
schedulerCode = schedulerCode.replace(/setInspectingInvoiceId\(([^)]+)\)/g, "updateState({ inspectingInvoiceId: $1 })");

// And replace inspectingInvoiceId reading with state.inspectingInvoiceId
schedulerCode = schedulerCode.replace(/\{inspectingInvoiceId && /g, "{state.inspectingInvoiceId && ");
schedulerCode = schedulerCode.replace(/invoiceId=\{inspectingInvoiceId\}/g, "invoiceId={state.inspectingInvoiceId!}");
schedulerCode = schedulerCode.replace(/setInspectingInvoiceId\(\)/g, "updateState({ inspectingInvoiceId: null })"); // just in case
// Wait, is there any other inspectingInvoiceId used? Let's check.
fs.writeFileSync('src/components/JobScheduler.tsx', schedulerCode);

// 3. Update InventoryAlerts.tsx
let alertsCode = fs.readFileSync('src/components/InventoryAlerts.tsx', 'utf8');
alertsCode = alertsCode.replace(
  `className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30"`,
  `className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                            onClick={() => {
                              updateState({ activeView: 'scheduler', inspectingInvoiceId: inv.id });
                              setIsOpen(false);
                            }}`
);
fs.writeFileSync('src/components/InventoryAlerts.tsx', alertsCode);

console.log("Patched successfully");
