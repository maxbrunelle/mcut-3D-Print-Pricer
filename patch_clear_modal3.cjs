const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

code = code.replace(
  "const handleClearForm = () => {\\n    setShowClearConfirm(true);\\n  };",
  "const handleClearForm = (e?: React.MouseEvent) => {\\n    if (e) e.preventDefault();\\n    setShowClearConfirm(true);\\n  };"
);

fs.writeFileSync('src/components/Calculator.tsx', code);
