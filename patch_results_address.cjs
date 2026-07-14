const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const regexAddress = /\/\/ From Address\s+let fromY = 80;\s+doc\.text\(state\.companyName \|\| 'mcut', 110, fromY\);\s+fromY \+= 5;\s+const hasCompanyAddress = state\.companyStreet \|\| state\.companyCity \|\| state\.companyCountry;\s+if \(hasCompanyAddress\) \{([\s\S]*?)fromY \+= 5;\s+\}/;

const replaceAddress = `// From Address
    let fromY = 80;
    doc.text(state.companyName || 'mcut', 110, fromY);
    fromY += 5;

    if (state.invoicePreferences?.showBusinessAddress !== false) {
      const hasCompanyAddress = state.companyStreet || state.companyCity || state.companyCountry;
      if (hasCompanyAddress) {
$1fromY += 5;
      }
    }`;

code = code.replace(regexAddress, replaceAddress);

fs.writeFileSync('src/components/Results.tsx', code);
