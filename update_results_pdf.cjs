const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const targetStr = `      state.extraItems.forEach((item) => {
        if (item.name) {
          const qty = item.quantity || 0;
          const price = item.price || 0;
          const amount = qty * price;
          tableBody.push([
            \`Extra: \${item.name}\`.replace(/[^\\x00-\\x7F]/g, ''),
            qty.toString(),
            \`\${cSym}\${price.toFixed(2)}\`,
            \`\${cSym}\${amount.toFixed(2)}\`
          ]);
        }
      });
    }`;

const replacementStr = `      state.extraItems.forEach((item) => {
        if (item.name) {
          const qty = item.quantity || 0;
          const price = item.price || 0;
          const amount = qty * price;
          tableBody.push([
            \`Extra: \${item.name}\`.replace(/[^\\x00-\\x7F]/g, ''),
            qty.toString(),
            \`\${cSym}\${price.toFixed(2)}\`,
            \`\${cSym}\${amount.toFixed(2)}\`
          ]);
        }
      });
    }

    // CAD/Scanning Services
    if (state.designTasks && state.designTasks.length > 0) {
      state.designTasks.forEach((task) => {
        if (task.name) {
          const totalHours = (task.timeHrs || 0) + (task.timeMin || 0) / 60;
          const price = task.pricePerHour || 0;
          const amount = totalHours * price;
          tableBody.push([
            \`Service: \${task.name}\`.replace(/[^\\x00-\\x7F]/g, ''),
            \`\${totalHours.toFixed(2)} hrs\`,
            \`\${cSym}\${price.toFixed(2)}/hr\`,
            \`\${cSym}\${amount.toFixed(2)}\`
          ]);
        }
      });
    }`;

// Since the `\x00` gets parsed strangely, I'll use index matching or regex.
const idx = code.indexOf('if (state.extraItems && state.extraItems.length > 0) {');
if (idx !== -1) {
  const endIdx = code.indexOf('    // Hardware', idx);
  let section = code.substring(idx, endIdx);
  section = section + replacementStr.substring(replacementStr.indexOf('// CAD/Scanning Services'));
  code = code.substring(0, idx) + section + code.substring(endIdx);
  fs.writeFileSync('src/components/Results.tsx', code);
  console.log("Updated Results.tsx PDF");
} else {
  console.log("Could not find insertion point");
}
