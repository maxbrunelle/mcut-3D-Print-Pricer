const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const tableBodyLogic = `    // Body rows per part
    let tableBody = partCalculations.map((p, idx) => {
      // Approximate the pre-tax price per unit for this part, proportionally to its baseCost
      const partRatio = baseCost > 0 ? (p.pBaseCost * p.part.quantity) / baseCost : 0;
      const partTotalPreTax = subtotalRaw * partRatio;
      const partUnitPrice = p.part.quantity > 0 ? partTotalPreTax / p.part.quantity : 0;

      return [
        (p.part.name || \`Part \${idx + 1}\`).replace(/[^\\x00-\\x7F]/g, ''),
        p.part.quantity.toString(),
        \`\${cSym}\${partUnitPrice.toFixed(2)}\`,
        \`\${cSym}\${partTotalPreTax.toFixed(2)}\`
      ];
    });`;

const newTableBodyLogic = `    // Body rows per part
    let tableBody = partCalculations.map((p, idx) => {
      // Approximate the pre-tax price per unit for this part, proportionally to its baseCost
      const partRatio = baseCost > 0 ? (p.pBaseCost * p.part.quantity) / baseCost : 0;
      const partTotalPreTax = subtotalRaw * partRatio;
      const partUnitPrice = p.part.quantity > 0 ? partTotalPreTax / p.part.quantity : 0;
      
      let description = (p.part.name || \`Part \${idx + 1}\`).replace(/[^\\x00-\\x7F]/g, '');
      
      if (state.invoicePreferences?.showMaterialBreakdown !== false) {
        const mats = p.part.materials.map(m => m.name).join(', ').replace(/[^\\x00-\\x7F]/g, '');
        if (mats) {
          description += \`\\nMaterial: \${mats}\`;
        }
      }

      if (state.invoicePreferences?.showPrintTime !== false) {
        description += \`\\nPrint time: \${p.part.printTimeHrs}h \${p.part.printTimeMin}m\`;
      }

      return [
        description,
        p.part.quantity.toString(),
        \`\${cSym}\${partUnitPrice.toFixed(2)}\`,
        \`\${cSym}\${partTotalPreTax.toFixed(2)}\`
      ];
    });`;

code = code.replace(tableBodyLogic, newTableBodyLogic);

fs.writeFileSync('src/components/Results.tsx', code);
