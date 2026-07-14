const fs = require('fs');
let code = fs.readFileSync('src/components/Results.tsx', 'utf8');

const insertState = `  const { state, updateState } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  React.useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 400);
    return () => clearTimeout(timer);
  }, [
    state.parts,
    state.laborTimeMin,
    state.postProcessingTasks,
    state.hardwareCost,
    state.packagingCost,
    state.shippingCost,
    state.extraItems,
    state.discountValue,
    state.discountType,
    state.applyTaxes,
    state.gstRate,
    state.qstRate,
    state.electricityCost,
    state.printerPower,
    state.printerCost,
    state.printerLifespanHours,
    state.laborRatePerHour,
    state.failureRate,
    state.selectedMargin,
    state.customMargin,
    state.currency
  ]);`;

code = code.replace(/  const \{ state, updateState \} = useAppContext\(\);\n  const \[isSyncing, setIsSyncing\] = useState\(false\);/, insertState);

const insertPulse = `  return (
    <div className={\`bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/40 dark:border-slate-700/40 p-6 md:p-8 transition-all duration-300 \${isCalculating ? 'opacity-70 scale-[0.99] filter blur-[1px]' : 'opacity-100 scale-100 filter blur-0'}\`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 dark:text-slate-100 drop-shadow-sm"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Suggested Pricing</h2>
        </div>
        {isCalculating && (
          <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </div>
        )}
      </div>`;

code = code.replace(/  return \(\n    <div className="bg-white\/40 dark:bg-slate-800\/40 backdrop-blur-xl rounded-3xl shadow-\[0_8px_32px_0_rgba\(31,38,135,0\.07\)\] border border-white\/40 dark:border-slate-700\/40 p-6 md:p-8">\n      <div className="flex items-center gap-2 mb-6">\n        <svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 dark:text-slate-100 drop-shadow-sm"><path d="m12 3-1\.912 5\.813a2 2 0 0 1-1\.275 1\.275L3 12l5\.813 1\.912a2 2 0 0 1 1\.275 1\.275L12 21l1\.912-5\.813a2 2 0 0 1 1\.275-1\.275L21 12l-5\.813-1\.912a2 2 0 0 1-1\.275-1\.275L12 3Z"\/><\/svg>\n        <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Suggested Pricing<\/h2>\n      <\/div>/, insertPulse);

fs.writeFileSync('src/components/Results.tsx', code);
