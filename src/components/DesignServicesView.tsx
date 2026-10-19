import React, { useState } from 'react';
import { useAppContext, InventoryDesignService } from '../lib/store';
import { PenTool, Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export function DesignServicesView() {
  const { state, updateState } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  const [formState, setFormState] = useState<Partial<InventoryDesignService>>({
    name: '',
    pricePerHour: 0
  });

  const services = state.inventoryDesignServices || [];

  const handleOpenForm = (service?: InventoryDesignService) => {
    if (service) {
      setFormState(service);
      setEditingServiceId(service.id);
    } else {
      setFormState({
        name: '',
        pricePerHour: 0
      });
      setEditingServiceId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingServiceId(null);
  };

  const handleSave = () => {
    if (!formState.name) return;

    if (editingServiceId) {
      updateState({
        inventoryDesignServices: services.map(s => 
          s.id === editingServiceId ? { ...s, ...formState } as InventoryDesignService : s
        )
      });
    } else {
      const newService: InventoryDesignService = {
        id: Date.now().toString(),
        name: formState.name,
        pricePerHour: formState.pricePerHour || 0
      };
      updateState({ inventoryDesignServices: [...services, newService] });
    }
    handleCloseForm();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this service?')) {
      updateState({
        inventoryDesignServices: services.filter(s => s.id !== id)
      });
    }
  };

  const animationsEnabled = state.animationsEnabled?.popups !== false;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-[calc(100vh-8rem)] animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
          <PenTool size={20} className="text-blue-500" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">CAD & Scanning Services</h2>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        {services.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed h-full flex flex-col items-center justify-center">
            <PenTool size={48} className="mx-auto mb-4 opacity-50" />
            <p>No design services in inventory.</p>
            <p className="text-sm mt-1">Add a service like "CAD Design" or "3D Scanning" to use it in quotes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {services.map(service => (
              <div 
                key={service.id} 
                className="bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-md rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 group"
                onClick={() => handleOpenForm(service)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 pr-2">{service.name}</h3>
                  <button 
                    onClick={(e) => handleDelete(service.id, e)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    ${service.pricePerHour}/hr
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && createPortal(
        <AnimatePresence mode="wait">
          <motion.div 
            initial={animationsEnabled ? { opacity: 0 } : false}
            animate={animationsEnabled ? { opacity: 1 } : false}
            exit={animationsEnabled ? { opacity: 0 } : false}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={handleCloseForm} />
            <motion.div 
              initial={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
              animate={animationsEnabled ? { scale: 1, opacity: 1 } : false}
              exit={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                  {editingServiceId ? 'Edit Service' : 'Add Service'}
                </h3>
                <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Service Name</label>
                  <input 
                    type="text" 
                    value={formState.name} 
                    onChange={e => setFormState({ ...formState, name: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all text-slate-800 dark:text-white"
                    placeholder="e.g. 3D Scanning"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Price per Hour ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formState.pricePerHour || ''} 
                    onChange={e => setFormState({ ...formState, pricePerHour: e.target.valueAsNumber || 0 })} 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all text-slate-800 dark:text-white"
                    placeholder="45.00"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button 
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formState.name}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium"
                >
                  Save Service
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
