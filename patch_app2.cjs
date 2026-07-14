const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { ClientManagement } from './components/ClientManagement';",
  ""
);

code = code.replace(
  "<ClientManagement />",
  ""
);

fs.writeFileSync('src/App.tsx', code);
