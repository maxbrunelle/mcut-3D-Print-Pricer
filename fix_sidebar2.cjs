const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const lastIndex = code.lastIndexOf('</div>');
code = code.substring(0, lastIndex).trim() + '\n  );\n}\n';

fs.writeFileSync('src/components/Sidebar.tsx', code);
