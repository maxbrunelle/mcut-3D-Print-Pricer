const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /\{state\.appLogo \? \([\s\S]*?\) : null\}/,
  ''
);

fs.writeFileSync('src/components/Header.tsx', code);
