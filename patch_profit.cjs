const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const calcBlock = `  const completedRevenue = invoices
    .filter(inv => inv.status === 'Completed')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);`;

const newCalcBlock = `  const completedRevenue = invoices
    .filter(inv => inv.status === 'Completed')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  let totalProfit = 0;
  let totalCompletedIncome = 0;

  invoices.filter(inv => inv.status === 'Completed').forEach(inv => {
    const s = inv.savedState || {};
    const parts = s.parts || [];
    
    let pMaterialCost = 0;
    let pPrintTimeHours = 0;
    
    parts.forEach((part) => {
      const q = part.quantity || 1;
      const matCost = (part.materials || []).reduce((sum, m) => sum + ((m.weight || 0) / 1000) * (m.costPerKg || 0), 0);
      pMaterialCost += matCost * q;
      pPrintTimeHours += ((part.printTimeHrs || 0) + ((part.printTimeMin || 0) / 60)) * q;
    });

    const electricityCost = (state.printerPower * pPrintTimeHours / 1000) * state.electricityCost;
    const machineCost = (state.printerCost / state.printerLifespanHours) * pPrintTimeHours;
    
    const postProcessingTime = (s.postProcessingTasks || []).reduce((sum, task) => sum + (task.timeMin || 0), 0);
    const totalLaborTimeMin = (s.laborTimeMin || 0) + postProcessingTime;
    const laborCost = (totalLaborTimeMin / 60) * (state.laborRatePerHour || 0);
    
    const hardwareCost = s.hardwareCost || 0;
    const packagingCost = s.packagingCost || 0;
    
    const baseCost = pMaterialCost + electricityCost + machineCost + laborCost + hardwareCost + packagingCost;
    const failureCost = baseCost * (state.failureRate / 100);
    const totalCost = baseCost + failureCost;
    
    const extraItemsTotal = (s.extraItems || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    const margin = s.selectedMargin || 40;
    let preTaxTotal = totalCost + (totalCost * (margin / 100)) + (s.shippingCost || 0) + extraItemsTotal;
    
    const discountVal = s.discountValue || 0;
    if (s.discountType === 'percentage') {
      preTaxTotal = preTaxTotal * (1 - discountVal / 100);
    } else {
      preTaxTotal = Math.max(0, preTaxTotal - discountVal);
    }

    totalCompletedIncome += preTaxTotal;
    totalProfit += (preTaxTotal - (totalCost + (s.shippingCost || 0))); 
  });

  const profitMarginPercent = totalCompletedIncome > 0 ? (totalProfit / totalCompletedIncome) * 100 : 0;
`;

code = code.replace(calcBlock, newCalcBlock);

const kpiBlockOld = `              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center">`;

const kpiBlockNew = `              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex flex-col justify-center">
                  <span className="text-rose-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Net Profit
                  </span>
                  <div className="flex items-baseline gap-2">
                    <AnimatedNumber 
                      value={totalProfit} 
                      format={(v) => \`\${cSym}\${v.toFixed(2)}\`} 
                      className="text-3xl font-black text-slate-800 dark:text-slate-100" 
                      enabled={state.animationsEnabled?.numbers !== false}
                    />
                    <span className="text-sm font-medium text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">
                      {profitMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center">`;

code = code.replace(kpiBlockOld, kpiBlockNew);

fs.writeFileSync('src/components/Dashboard.tsx', code);
