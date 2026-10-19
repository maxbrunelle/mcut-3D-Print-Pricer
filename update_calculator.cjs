const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

// Add add/remove/change handlers
const designHandlers = `
  const addDesignTask = () => {
    const newTask = {
      id: Math.random().toString(),
      name: '',
      timeHrs: 1,
      timeMin: 0,
      pricePerHour: 50
    };
    updateState({ designTasks: [...(state.designTasks || []), newTask] });
  };

  const addInventoryDesignTask = (inventoryServiceId: string) => {
    const invService = state.inventoryDesignServices?.find(i => i.id === inventoryServiceId);
    if (!invService) return;
    
    const newTask = {
      id: Math.random().toString(),
      name: invService.name,
      timeHrs: 1,
      timeMin: 0,
      pricePerHour: invService.pricePerHour,
      inventoryServiceId: invService.id
    };
    updateState({ designTasks: [...(state.designTasks || []), newTask] });
  };

  const removeDesignTask = (taskId: string) => {
    updateState({ 
      designTasks: state.designTasks?.filter(i => i.id !== taskId) || [] 
    });
  };

  const handleDesignTaskChange = (taskId: string, field: string, value: any) => {
    const newTasks = state.designTasks?.map(i => 
      i.id === taskId ? { ...i, [field]: value } : i
    ) || [];
    updateState({ designTasks: newTasks });
  };
`;

code = code.replace("const removeExtraItem = (itemId: string) => {", designHandlers + "\n  const removeExtraItem = (itemId: string) => {");

// Add section to UI
// We will place it after Extra Items
const extraItemsSectionEnd = `              <div className="text-center py-6 bg-white/30 dark:bg-slate-800/40 rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                <p className="text-sm text-slate-500 dark:text-slate-400">No extra items added.</p>
              </div>
            )}
          </div>
        </div>`;

const designServicesSection = `

        {/* CAD & Scanning Services Section */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/60 shadow-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PenTool size={18} className="text-blue-500" />
              CAD & Scanning Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {state.inventoryDesignServices && state.inventoryDesignServices.length > 0 && (
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
              )}
              <button 
                onClick={addDesignTask}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus size={14} /> Custom Service
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {state.designTasks?.length > 0 ? (
              <AnimatePresence>
              {state.designTasks.map((task) => (
                <motion.div 
                  key={task.id} 
                  layout={state.animationsEnabled?.layouts !== false}
                  initial={state.animationsEnabled?.layouts !== false ? { opacity: 0, x: -10 } : false}
                  animate={state.animationsEnabled?.layouts !== false ? { opacity: 1, x: 0 } : false}
                  exit={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                  className="flex flex-col sm:flex-row gap-3 p-3 bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700/50 rounded-xl items-start sm:items-center relative group"
                >
                  <button 
                    onClick={() => removeDesignTask(task.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all sm:static sm:opacity-100 sm:shadow-none sm:bg-transparent sm:dark:bg-transparent shrink-0 focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
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
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-6 bg-white/30 dark:bg-slate-800/40 rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                <p className="text-sm text-slate-500 dark:text-slate-400">No CAD or scanning services added.</p>
              </div>
            )}
          </div>
        </div>
`;

code = code.replace(extraItemsSectionEnd, extraItemsSectionEnd + designServicesSection);

if (!code.includes("PenTool")) {
  code = code.replace("import { Plus, Trash2", "import { Plus, Trash2, PenTool");
}

fs.writeFileSync('src/components/Calculator.tsx', code);
console.log("Updated Calculator.tsx");
