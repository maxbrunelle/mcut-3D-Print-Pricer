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

    if (state.designTasks && state.designTasks.length > 0) {
      state.designTasks.forEach((task) => {
        if (task.name) {
          const totalHours = (task.timeHrs || 0) + (task.timeMin || 0) / 60;
          const price = task.pricePerHour || 0;
          const amount = totalHours * price;
          tableBody.push([
            \`CAD/Scan: \${task.name}\`.replace(/[^\\x00-\\x7F]/g, ''),
            \`\${totalHours.toFixed(2)} hrs\`,
            \`\${cSym}\${price.toFixed(2)}/hr\`,
            \`\${cSym}\${amount.toFixed(2)}\`
          ]);
        }
      });
    }`;

// Avoid issues with regex special characters and replace exactly
const idx = code.indexOf(targetStr);
if (idx !== -1) {
  code = code.substring(0, idx) + replacementStr + code.substring(idx + targetStr.length);
  fs.writeFileSync('src/components/Results.tsx', code);
  console.log("Successfully updated PDF generation");
} else {
  console.log("Could not find the target string exactly. Target was:\n" + targetStr);
}
