const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetMenu = `    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Wrench },
  ];`;

const replacementMenu = `    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Wrench },
    { id: 'services', label: 'CAD & Scanning', icon: PenTool },
  ];`;

code = code.replace("Wrench,", "Wrench,\n  PenTool,");
code = code.replace(targetMenu, replacementMenu);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Updated Sidebar.tsx");
