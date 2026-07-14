const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

code = code.replace(
  /React\.useEffect\(\(\) => \{\n    if \(state\.editingInvoiceId && state\.parts\.length > 0\) \{\n      setExpandedPartId\(state\.parts\[0\]\.id\);\n    \}\n  \}, \[state\.editingInvoiceId, state\.parts\]\);/g,
  `React.useEffect(() => {
    if (state.editingInvoiceId && state.parts.length > 0) {
      setExpandedPartId(state.parts[0].id);
    }
  }, [state.editingInvoiceId]);` // Only depend on editingInvoiceId
);

fs.writeFileSync('src/components/Calculator.tsx', code);
