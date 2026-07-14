import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, InventoryExtraItem } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export function ExtraItemInventory() {
  const { state, updateState } = useAppContext();
  const getCurrencySymbol = (code: string | undefined) => {
    switch (code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  const cSym = getCurrencySymbol(state.currency);
  const [isOpen, setIsOpen] = useState(false);
  const inventory = state.inventoryExtraItems || [];

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<InventoryExtraItem>>({
    name: '',
    price: 0,
    quantity: 0,
    rebuyLink: ''
  });

  const handleOpenForm = (item?: InventoryExtraItem) => {
    if (item) {
      setFormState(item);
      setEditingItemId(item.id);
    } else {
      setFormState({
        name: '',
        price: 0,
        quantity: 0,
        rebuyLink: ''
      });
      setEditingItemId(null);
    }
  };

  const handleSaveItem = () => {
    if (!formState.name) return;
    
    if (editingItemId) {
      updateState({
        inventoryExtraItems: inventory.map(i => i.id === editingItemId ? { ...i, ...formState } as InventoryExtraItem : i)
      });
    } else {
      const newItem: InventoryExtraItem = {
        id: Date.now().toString(),
        name: formState.name || 'Unknown',
        price: formState.price || 0,
        quantity: formState.quantity || 0,
        rebuyLink: formState.rebuyLink || ''
      };
      updateState({
        inventoryExtraItems: [...inventory, newItem]
      });
    }
    setEditingItemId(null);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState({ inventoryExtraItems: inventory.filter(i => i.id !== id) });
    if (editingItemId === id) setEditingItemId(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 shadow-sm text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-md font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        Manage Extra Items ({inventory.length})
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              animate={state.animationsEnabled?.popups !== false ? { opacity: 1 } : false}
              exit={state.animationsEnabled?.popups !== false ? { opacity: 0 } : false}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                animate={state.animationsEnabled?.popups !== false ? { scale: 1, opacity: 1 } : false}
                exit={state.animationsEnabled?.popups !== false ? { scale: 0.95, opacity: 0 } : false}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-5xl max-h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Extra Items Inventory</h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 pr-2">
              {/* Left Column: List */}
              <div className="flex-1">
                {inventory.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                    <p className="mb-4">Your extra items inventory is empty.</p>
                    <button 
                      onClick={() => handleOpenForm()}
                      className="bg-blue-500/80 hover:bg-blue-600/90 text-white px-6 py-2 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] border border-blue-400/50 font-medium"
                    >
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {inventory.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleOpenForm(item)}
                        className={`bg-white/50 dark:bg-slate-800/50 border shadow-sm rounded-2xl p-4 flex flex-col transition-all duration-300 cursor-pointer ${editingItemId === item.id ? 'border-blue-400 ring-1 ring-blue-400/50 bg-white/70 dark:bg-slate-800/70' : 'border-white/60 dark:border-slate-700/60 hover:bg-white/70 dark:bg-slate-800/70'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              {item.name}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap gap-4 items-center">
                              <span>Price: <span className="font-medium">{cSym}{item.price.toFixed(2)}</span></span>
                              <span className="flex items-center gap-1">
                                Qty: 
                                <span className={`font-medium px-2 py-0.5 rounded-md ${
                                  (item.quantity || 0) > 10 ? 'bg-green-100 text-green-700' : 
                                  (item.quantity || 0) > 0 ? 'bg-amber-100 text-amber-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {item.quantity || 0}
                                </span>
                              </span>
                              {item.rebuyLink && (
                                <a 
                                  href={item.rebuyLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-md"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                  Rebuy
                                </a>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => handleOpenForm()}
                      className="mt-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:border-blue-400/50 hover:bg-blue-50/30 hover:text-blue-600 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      Add New Item
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Form */}
              <div className="w-full md:w-[350px]">
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-700/60 p-6 sticky top-0 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-5">{editingItemId ? 'Edit Item' : 'New Item'}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Item Name</label>
                      <input 
                        type="text" 
                        value={formState.name} 
                        onChange={e => setFormState({...formState, name: e.target.value})}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        placeholder="e.g. Keychain Ring"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Price per Unit ({cSym})</label>
                      <input 
                        type="number" 
                        value={formState.price === 0 ? '' : formState.price} 
                        onChange={e => setFormState({...formState, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Quantity in Stock</label>
                      <input 
                        type="number" 
                        value={formState.quantity === 0 && !editingItemId ? '' : formState.quantity} 
                        onChange={e => setFormState({...formState, quantity: parseInt(e.target.value, 10) || 0})}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        placeholder="e.g. 50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Rebuy Link (Optional)</label>
                      <input 
                        type="url" 
                        value={formState.rebuyLink || ''} 
                        onChange={e => setFormState({...formState, rebuyLink: e.target.value})}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all text-slate-800 dark:text-white"
                        placeholder="https://amazon.com/..."
                      />
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button 
                        onClick={handleSaveItem}
                        className="flex-1 py-2 bg-blue-500/80 hover:bg-blue-600/90 text-white font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)] border border-blue-400/50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {editingItemId ? 'Update Item' : 'Add Item'}
                      </button>
                      {editingItemId && (
                        <button 
                          onClick={() => handleOpenForm()}
                          className="px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm rounded-xl hover:bg-white/70 dark:bg-slate-800/70 transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}