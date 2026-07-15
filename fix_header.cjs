const fs = require('fs');

let code = fs.readFileSync('src/components/Header.tsx', 'utf8');
code = code.replace(/import \{ Settings \} from '\.\/Settings';\n/, '');
code = code.replace(/import \{ InventoryAlerts \} from '\.\/InventoryAlerts';\n/, '');
code = code.replace(/<div className="flex items-center gap-3">\s*<InventoryAlerts \/>\s*<Settings \/>\s*<\/div>/, '');

fs.writeFileSync('src/components/Header.tsx', code);
