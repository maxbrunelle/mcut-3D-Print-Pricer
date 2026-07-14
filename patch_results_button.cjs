const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

code = code.replace(
  "{isSyncing ? 'Saving...' : 'Save Quote'}",
  "{isSyncing ? 'Saving...' : state.editingInvoiceId ? 'Update Quote' : 'Save Quote'}"
);

code = code.replace(
  "Save Quote\\n          </button>",
  "{state.editingInvoiceId ? 'Update Quote' : 'Save Quote'}\\n          </button>"
);

fs.writeFileSync('src/components/Results.tsx', code);
