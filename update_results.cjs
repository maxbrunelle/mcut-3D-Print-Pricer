const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

// Add designTasksCost calculation
const designTasksTotalString = `  const extraItemsTotal = (state.extraItems || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);`;
const newDesignTasksTotalString = `  const extraItemsTotal = (state.extraItems || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
  const designTasksTotal = (state.designTasks || []).reduce((sum, task) => sum + ((task.timeHrs || 0) + (task.timeMin || 0)/60) * (task.pricePerHour || 0), 0);`;
code = code.replace(designTasksTotalString, newDesignTasksTotalString);

// Add to preTaxTotal calculation
const preTaxTotalOld = `let preTaxTotal = subtotal + markupAmount + (state.shippingCost || 0) + extraItemsTotal;`;
const preTaxTotalNew = `let preTaxTotal = subtotal + markupAmount + (state.shippingCost || 0) + extraItemsTotal + designTasksTotal;`;
code = code.replace(preTaxTotalOld, preTaxTotalNew); // calculateTotal
code = code.replace(preTaxTotalOld, preTaxTotalNew); // calculateSubtotalRaw

// Add to PieChart breakdown
const pieChartMaterial = `{ name: 'Material', value: totalMaterialCost, color: '#3b82f6' },`;
const pieChartMaterialNew = `{ name: 'Material', value: totalMaterialCost, color: '#3b82f6' },
                  { name: 'CAD/Scan', value: designTasksTotal, color: '#f43f5e' },`;
// Be careful with multiple replaces here, pieChartMaterial appears twice.
// Since we used regex, it will replace both.
code = code.replace(new RegExp(pieChartMaterial, 'g'), pieChartMaterialNew);

// Add to Invoice PDF
const extraItemsTableRow = `      if (state.extraItems && state.extraItems.length > 0) {
        state.extraItems.forEach(item => {
          tableBody.push([
            item.name.replace(/[^\\x00-\\x7F]/g, ''),
            item.quantity.toString(),
            \`\${cSym}\${item.price.toFixed(2)}\`,
            \`\${cSym}\${(item.quantity * item.price).toFixed(2)}\`
          ]);
        });
      }`;

const designTasksTableRow = `      if (state.extraItems && state.extraItems.length > 0) {
        state.extraItems.forEach(item => {
          tableBody.push([
            item.name.replace(/[^\\x00-\\x7F]/g, ''),
            item.quantity.toString(),
            \`\${cSym}\${item.price.toFixed(2)}\`,
            \`\${cSym}\${(item.quantity * item.price).toFixed(2)}\`
          ]);
        });
      }
      if (state.designTasks && state.designTasks.length > 0) {
        state.designTasks.forEach(task => {
          const totalHours = (task.timeHrs || 0) + (task.timeMin || 0) / 60;
          tableBody.push([
            task.name.replace(/[^\\x00-\\x7F]/g, ''),
            totalHours.toFixed(2) + ' hrs',
            \`\${cSym}\${(task.pricePerHour || 0).toFixed(2)}/hr\`,
            \`\${cSym}\${(totalHours * (task.pricePerHour || 0)).toFixed(2)}\`
          ]);
        });
      }`;
code = code.replace(extraItemsTableRow.replace(/\\x/g, '\\x'), designTasksTableRow.replace(/\\x/g, '\\x'));

fs.writeFileSync('src/components/Results.tsx', code);
console.log("Updated Results.tsx");
