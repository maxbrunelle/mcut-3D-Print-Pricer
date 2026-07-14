const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const regex = /export function Results\(\) \{\n  const \{ state, updateState \} = useAppContext\(\);\n  const \[isSyncing, setIsSyncing\] = useState\(false\);/;

const replace = `export function Results() {
  const { state, updateState } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E: Export / Save PDF
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        savePdfLocal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Note: without dependencies so savePdfLocal is current, or we can use a ref. Wait, if we use it without deps, it will add/remove event listener every render, which is fine or we can use an effect that depends on savePdfLocal. But savePdfLocal is created on every render.
`;

code = code.replace(regex, replace);

fs.writeFileSync('src/components/Results.tsx', code);
