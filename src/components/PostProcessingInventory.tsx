import React, { useState } from 'react';
import { useAppContext, PostProcessingTask } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Wrench, Clock, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function PostProcessingInventory() {
  const { state, updateState } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PostProcessingTask | null>(null);
  
  const [formData, setFormData] = useState<Partial<PostProcessingTask>>({});

  const tasks = state.inventoryPostProcessingTasks || [];

  const handleEdit = (task: PostProcessingTask) => {
    setEditingTask(task);
    setFormData({ ...task });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this task?')) {
      updateState({
        inventoryPostProcessingTasks: tasks.filter(t => t.id !== id)
      });
    }
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setFormData({ timeMin: 15 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingTask) {
      updateState({
        inventoryPostProcessingTasks: tasks.map(t => 
          t.id === editingTask.id ? { ...t, ...formData } as PostProcessingTask : t
        )
      });
    } else {
      const newTask: PostProcessingTask = {
        id: Date.now().toString(),
        name: formData.name,
        timeMin: formData.timeMin || 0
      };
      updateState({
        inventoryPostProcessingTasks: [...tasks, newTask]
      });
    }
    setShowModal(false);
  };

  const animationsEnabled = state.animationsEnabled?.popups !== false;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-wrap justify-between items-center mb-2 gap-4">
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] whitespace-nowrap ml-auto"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl border border-dashed border-white/60 dark:border-slate-700/60 p-8">
            <Wrench size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">Add post-processing tasks to use them in your quotes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {tasks.map(task => (
              <div 
                key={task.id}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pr-2">{task.name}</div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                      onClick={() => handleEdit(task)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mt-auto bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-medium">{task.timeMin} mins</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && createPortal(
        <AnimatePresence mode="wait">
          <motion.div 
            initial={animationsEnabled ? { opacity: 0 } : false}
            animate={animationsEnabled ? { opacity: 1 } : false}
            exit={animationsEnabled ? { opacity: 0 } : false}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowModal(false)} />
            <motion.div 
              initial={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
              animate={animationsEnabled ? { scale: 1, opacity: 1 } : false}
              exit={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Name *</label>
                  <input 
                    autoFocus
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sanding"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Time (mins)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white pr-12"
                      value={formData.timeMin || ''}
                      onChange={e => setFormData({ ...formData, timeMin: parseInt(e.target.value) || 0 })}
                      placeholder="15"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      min
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 flex-wrap">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.name}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
                >
                  Save
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
