const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

// The original file is present at the end of the current file.
// We just need to find the last occurrence of "import React" and take everything from there to the end.
const lastImportIdx = code.lastIndexOf("import React");
if (lastImportIdx !== -1) {
  let originalCode = code.substring(lastImportIdx);
  fs.writeFileSync('src/components/Results.tsx', originalCode);
  console.log("Restored original file from the duplicated content");
} else {
  console.log("Could not find the original file");
}
