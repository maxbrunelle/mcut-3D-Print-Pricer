const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

const effectCode = `  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+C: Clear Form
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowClearConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {`;

code = code.replace("  React.useEffect(() => {", effectCode);

fs.writeFileSync('src/components/Calculator.tsx', code);
