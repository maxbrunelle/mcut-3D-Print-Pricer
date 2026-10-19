const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

// 1. Add state variable for the modal
if (!code.includes('const [showDesignServicesModal, setShowDesignServicesModal] = useState(false);')) {
  code = code.replace(
    'const [showTasksModal, setShowTasksModal] = useState(false);',
    'const [showTasksModal, setShowTasksModal] = useState(false);\n  const [showDesignServicesModal, setShowDesignServicesModal] = useState(false);'
  );
}

// 2. Replace the dropdown with a "From List" button
const cadDropdownTarget = `              {state.inventoryDesignServices && state.inventoryDesignServices.length > 0 && (
                <select 
                  className="px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      addInventoryDesignTask(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Add from Inventory...</option>
                  {state.inventoryDesignServices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name} (\${inv.pricePerHour}/hr)</option>
                  ))}
                </select>
              )}`;

const cadListButton = `              {state.inventoryDesignServices && state.inventoryDesignServices.length > 0 && (
                <button
                  onClick={() => setShowDesignServicesModal(true)}
                  className="text-xs text-slate-600 dark:text-slate-300 font-medium hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-white/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/50 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  From List
                </button>
              )}`;

code = code.replace(cadDropdownTarget, cadListButton);

// 3. Make the items cleaner
const cadItemsTarget = `<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Service Name</label>
                      <input 
                        type="text" 
                        value={task.name} 
                        onChange={e => handleDesignTaskChange(task.id, 'name', e.target.value)}
                        placeholder="Service Name"
                        className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700/80 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-4 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Hours</label>
                        <input 
                          type="number" min="0" step="1" 
                          value={task.timeHrs || ''} 
                          onChange={e => handleDesignTaskChange(task.id, 'timeHrs', e.target.valueAsNumber || 0)}
                          className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700/80 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Mins</label>
                        <input 
                          type="number" min="0" max="59" step="1" 
                          value={task.timeMin || ''} 
                          onChange={e => handleDesignTaskChange(task.id, 'timeMin', e.target.valueAsNumber || 0)}
                          className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700/80 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Rate/hr ($)</label>
                      <input 
                        type="number" min="0" step="0.01" 
                        value={task.pricePerHour || ''} 
                        onChange={e => handleDesignTaskChange(task.id, 'pricePerHour', e.target.valueAsNumber || 0)}
                        className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-slate-700/80 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm dark:text-white"
                      />
                    </div>
                  </div>`;

const cadItemsReplacement = `<div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={task.name} 
                        onChange={e => handleDesignTaskChange(task.id, 'name', e.target.value)}
                        placeholder="Service Name (e.g., CAD Design)"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 px-0 py-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-24 relative">
                        <input 
                          type="number" min="0" step="1" 
                          value={task.timeHrs || ''} 
                          onChange={e => handleDesignTaskChange(task.id, 'timeHrs', e.target.valueAsNumber || 0)}
                          className="w-full pl-3 pr-8 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">h</span>
                      </div>
                      <div className="w-24 relative">
                        <input 
                          type="number" min="0" max="59" step="1" 
                          value={task.timeMin || ''} 
                          onChange={e => handleDesignTaskChange(task.id, 'timeMin', e.target.valueAsNumber || 0)}
                          className="w-full pl-3 pr-10 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">min</span>
                      </div>
                      <div className="w-28 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">$</span>
                        <input 
                          type="number" min="0" step="0.01" 
                          value={task.pricePerHour || ''} 
                          onChange={e => handleDesignTaskChange(task.id, 'pricePerHour', e.target.valueAsNumber || 0)}
                          className="w-full pl-7 pr-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>`;

// Note: I also need to update the container style to look more like the post processing task.
const originalContainer = `className="flex flex-col sm:flex-row gap-3 p-3 bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700/50 rounded-xl items-start sm:items-center relative group"`;
const newContainer = `className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white/60 dark:border-slate-700/60 group relative"`;

code = code.replace(cadItemsTarget, cadItemsReplacement);
code = code.replace(originalContainer, newContainer);

// Trash button styling:
const oldTrash = `className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all sm:static sm:opacity-100 sm:shadow-none sm:bg-transparent sm:dark:bg-transparent shrink-0 focus:opacity-100"`;
const newTrash = `className="absolute -top-2 -right-2 sm:static sm:-top-0 sm:-right-0 p-2 sm:p-2 bg-white dark:bg-slate-800 sm:bg-transparent sm:dark:bg-transparent text-slate-400 hover:text-red-500 rounded-full sm:rounded-xl hover:bg-red-50 sm:hover:bg-red-50 dark:hover:bg-red-900/30 shadow-md sm:shadow-none opacity-0 group-hover:opacity-100 transition-all shrink-0 focus:opacity-100 z-10"`;
code = code.replace(oldTrash, newTrash);

// 4. Add the modal itself
const modalCode = `      {/* CAD & Scanning Services Modal */}
      {createPortal(
        <AnimatePresence>
          {showDesignServicesModal && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-2xl flex flex-col max-h-[80vh]"
              >
                <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-2">
                    <PenTool size={20} className="text-blue-500" />
                    Select Service
                  </h3>
                  <button 
                    onClick={() => setShowDesignServicesModal(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.inventoryDesignServices?.length === 0 ? (
                     <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                        No services in list. You can add them from Settings.
                     </div>
                  ) : (
                    state.inventoryDesignServices?.map(service => (
                      <div 
                        key={service.id} 
                        className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-white/80 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600/50 transition-all group flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          addInventoryDesignTask(service.id);
                          setShowDesignServicesModal(false);
                        }}
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">{service.name}</div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">\${service.pricePerHour}/hr</div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                          <Plus size={16} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}`;

// Insert the modal before {/* Extra Items Modal */}
const modalInsertionPoint = '{/* Extra Items Modal */}';
code = code.replace(modalInsertionPoint, modalCode + '\n\n      ' + modalInsertionPoint);

fs.writeFileSync('src/components/Calculator.tsx', code);
console.log("Updated CAD Services UI");
