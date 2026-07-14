const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { ClientManagement } from')) {
    code = code.replace(
        "import { Dashboard } from './components/Dashboard';",
        "import { Dashboard } from './components/Dashboard';\nimport { ClientManagement } from './components/ClientManagement';"
    );
}

if (!code.includes('<ClientManagement />')) {
    code = code.replace(
        "<InvoiceHistory />",
        "<ClientManagement />\n          <InvoiceHistory />"
    );
}

fs.writeFileSync('src/App.tsx', code);
