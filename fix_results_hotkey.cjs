const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

// Remove the one at the top
const regexRemove = /  React\.useEffect\(\(\) => \{\n    const handleKeyDown = \(e: KeyboardEvent\) => \{\n      \/\/ Ctrl\+E: Export \/ Save PDF\n      if \(e\.ctrlKey && e\.key\.toLowerCase\(\) === 'e'\) \{\n        e\.preventDefault\(\);\n        savePdfLocal\(\);\n      \}\n    \};\n    window\.addEventListener\('keydown', handleKeyDown\);\n    return \(\) => window\.removeEventListener\('keydown', handleKeyDown\);\n  \}\); \/\/ Note.*?\n/s;

code = code.replace(regexRemove, '');

const regexInsert = /(return \(\n    <div className=")/;

const newInsert = `  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E: Export / Save PDF
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        savePdfLocal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  $1`;

code = code.replace(regexInsert, newInsert);

fs.writeFileSync('src/components/Results.tsx', code);
