const fs = require('fs');
let sidebarCode = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

sidebarCode = sidebarCode.replace(
  /\{ id: 'printers', label: 'Printers', icon: Printer,[\s\S]*?Sun\}/g,
  "{ id: 'printers', label: 'Printers', icon: Printer }"
);

fs.writeFileSync('src/components/Sidebar.tsx', sidebarCode);
