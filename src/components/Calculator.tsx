import { Calendar } from "lucide-react";
import { SpoolCombobox } from "./SpoolCombobox";
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, ProjectPart } from '../lib/store';
import { CustomerSelect } from './CustomerSelect';
import { motion, AnimatePresence } from 'motion/react';

export function Calculator() {
  const { state, updateState } = useAppContext();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showManageCustomersModal, setShowManageCustomersModal] = useState(false);
  const [showExtraItemsModal, setShowExtraItemsModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerStreet, setNewCustomerStreet] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('');
  const [newCustomerState, setNewCustomerState] = useState('Quebec');
  const [newCustomerZip, setNewCustomerZip] = useState('');
  const [newCustomerCountry, setNewCustomerCountry] = useState('Canada');
  

  const [expandedPartId, setExpandedPartId] = useState<string | null>(state.parts[0]?.id || null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+C: Clear Form
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowClearConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (state.editingInvoiceId && state.parts.length > 0) {
      setExpandedPartId(state.parts[0].id);
    }
  }, [state.editingInvoiceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    updateState({
      [name]: parsedValue
    });
  };

  const handlePartChange = (partId: string, field: keyof ProjectPart, value: any) => {
    const newParts = state.parts.map(p => 
      p.id === partId ? { ...p, [field]: value } : p
    );
    updateState({ parts: newParts });
  };

  const handlePartMaterialChange = (partId: string, materialId: string, field: string, value: string | number) => {
    const newParts = state.parts.map(p => {
      if (p.id !== partId) return p;
      return {
        ...p,
        materials: p.materials.map(m => m.id === materialId ? { ...m, [field]: value } : m)
      };
    });
    updateState({ parts: newParts });
  };

  const handlePartMaterialUpdate = (partId: string, materialId: string, updates: any) => {
    const newParts = state.parts.map(p => {
      if (p.id !== partId) return p;
      return {
        ...p,
        materials: p.materials.map(m => m.id === materialId ? { ...m, ...updates } : m)
      };
    });
    updateState({ parts: newParts });
  };

  const handleClearForm = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowClearConfirm(true);
  };

  const executeClearForm = () => {
    const newPartId = Math.random().toString();
    updateState({
      editingInvoiceId: null,
      projectName: '',
      parts: [
        {
          id: newPartId,
          name: '',
          isMultiMaterial: false,
          materials: [
            { id: Math.random().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
          ],
          printTimeHrs: 0,
          printTimeMin: 0,
          quantity: 1,
        }
      ],
      selectedCustomerId: null,
      extraItems: [],
      postProcessingTasks: [],
      laborTimeMin: 0,
      hardwareCost: 0,
      packagingCost: 0,
      shippingCost: 0,
      discountType: 'percentage',
      discountValue: 0,
      applyTaxes: true,
      selectedMargin: state.customMargin || 40
    });
    setExpandedPartId(newPartId);
    setShowClearConfirm(false);
  };

  const addPart = () => {
    const newPartId = Math.random().toString();
    const newPart: ProjectPart = {
      id: newPartId,
      name: `Part ${state.parts.length + 1}`,
      isMultiMaterial: false,
      materials: [
        { id: Math.random().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
      ],
      printTimeHrs: 0,
      printTimeMin: 0,
      quantity: 1
    };
    updateState({ parts: [...state.parts, newPart] });
    setExpandedPartId(newPartId);
  };

  const removePart = (id: string) => {
    const newParts = state.parts.filter(p => p.id !== id);
    updateState({ parts: newParts });
    if (expandedPartId === id) {
      setExpandedPartId(newParts.length > 0 ? newParts[0].id : null);
    }
  };

  const addMaterialToPart = (partId: string) => {
    const newParts = state.parts.map(p => {
      if (p.id !== partId) return p;
      return {
        ...p,
        materials: [
          ...p.materials,
          { id: Math.random().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
        ]
      };
    });
    updateState({ parts: newParts });
  };

  const removeMaterialFromPart = (partId: string, materialId: string) => {
    const newParts = state.parts.map(p => {
      if (p.id !== partId) return p;
      if (p.materials.length <= 1) return p;
      return {
        ...p,
        materials: p.materials.filter(m => m.id !== materialId)
      };
    });
    updateState({ parts: newParts });
  };

  const addPostProcessingTask = () => {
    const newTask = {
      id: Math.random().toString(),
      name: '',
      timeMin: 0
    };
    updateState({ postProcessingTasks: [...(state.postProcessingTasks || []), newTask] });
  };

  const removePostProcessingTask = (taskId: string) => {
    updateState({ 
      postProcessingTasks: state.postProcessingTasks?.filter(t => t.id !== taskId) || [] 
    });
  };

  const handlePostProcessingTaskChange = (taskId: string, field: string, value: any) => {
    const newTasks = state.postProcessingTasks?.map(t => 
      t.id === taskId ? { ...t, [field]: value } : t
    ) || [];
    updateState({ postProcessingTasks: newTasks });
  };

  const addExtraItem = () => {
    const newItem = {
      id: Math.random().toString(),
      name: '',
      quantity: 1,
      price: 0
    };
    updateState({ extraItems: [...(state.extraItems || []), newItem] });
  };

  const addInventoryExtraItem = (inventoryItemId: string) => {
    const invItem = state.inventoryExtraItems?.find(i => i.id === inventoryItemId);
    if (!invItem) return;
    
    const newItem = {
      id: Math.random().toString(),
      name: invItem.name,
      quantity: 1,
      price: invItem.price,
      inventoryItemId: invItem.id
    };
    updateState({ extraItems: [...(state.extraItems || []), newItem] });
  };

  const removeExtraItem = (itemId: string) => {
    updateState({ 
      extraItems: state.extraItems?.filter(i => i.id !== itemId) || [] 
    });
  };

  const handleExtraItemChange = (itemId: string, field: string, value: any) => {
    const newItems = state.extraItems?.map(i => 
      i.id === itemId ? { ...i, [field]: value } : i
    ) || [];
    updateState({ extraItems: newItems });
  };

  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/40 dark:border-slate-700/40 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm">Print Calculator</h2>
        <button 
          onClick={handleClearForm}
          className="text-sm bg-white/50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-white/40 dark:border-slate-700/40 shadow-sm text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Clear Form
        </button>
      </div>

      <div className="space-y-6">
        {/* PROJECT NAME & DUE DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Project Name</label>
                        <input type="text" name="projectName" value={state.projectName} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" placeholder="e.g. Mechanical Keyboard Case" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Target Schedule Date
            </label>
            <input type="date" name="dueDate" value={state.dueDate || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Due / Scheduled Date</label>
            <input type="date" name="dueDate" value={state.dueDate || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CUSTOMER SELECTION */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Customer</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowManageCustomersModal(true)}
                  className="text-xs text-slate-600 dark:text-slate-300 font-medium hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Manage
                </button>
                <button 
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  New Customer
                </button>
              </div>
            </div>
            <CustomerSelect
              customers={state.customers}
              selectedCustomerId={state.selectedCustomerId}
              onChange={(id) => updateState({ selectedCustomerId: id || null })}
            />
          </div>
        </div>

        {/* PROJECT PARTS */}
        <div className="pt-6 border-t border-white/30 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Project Parts</h3>
            <button 
              onClick={addPart}
              className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-200/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add Part
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
            {state.parts.map((part, partIndex) => (
              <motion.div 
                key={part.id} 
                layout={state.animationsEnabled?.layouts !== false}
                initial={state.animationsEnabled?.layouts !== false ? { opacity: 0, y: 10 } : false}
                animate={state.animationsEnabled?.layouts !== false ? { opacity: 1, y: 0 } : false}
                exit={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                className="border border-white/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-800/40 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 dark:bg-slate-800/50 transition-colors ${expandedPartId === part.id ? 'bg-white/50 dark:bg-slate-800/50' : ''}`}
                  onClick={() => setExpandedPartId(expandedPartId === part.id ? null : part.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                      {partIndex + 1}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{part.name || `Unnamed Part ${partIndex + 1}`}</span>
                    <span className="text-xs text-slate-400 bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/40 dark:border-slate-700/40">
                      x{part.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePart(part.id); }}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${expandedPartId === part.id ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {expandedPartId === part.id && (
                  <div className="p-4 pt-0 border-t border-white/30 dark:border-slate-700/50 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Part Name</label>
                        <input 
                          type="text" 
                          value={part.name} 
                          onChange={(e) => handlePartChange(part.id, 'name', e.target.value)} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          value={part.quantity || ''} 
                          onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 1)} 
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* MATERIALS SECTION */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Materials</h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Multi-material</span>
                            <div 
                              className={`w-7 h-3.5 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${part.isMultiMaterial ? 'bg-blue-400/80' : 'bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60'}`}
                              onClick={() => {
                                const nextMulti = !part.isMultiMaterial;
                                if (!nextMulti) {
                                  handlePartChange(part.id, 'isMultiMaterial', false);
                                  handlePartChange(part.id, 'materials', [part.materials[0]]);
                                } else {
                                  handlePartChange(part.id, 'isMultiMaterial', true);
                                }
                              }}
                            >
                              <div className={`absolute top-[1px] left-[1px] w-3 h-3 rounded-full bg-white dark:bg-slate-800 transition-transform ${part.isMultiMaterial ? 'translate-x-3.5' : ''}`}></div>
                            </div>
                          </div>
                        </div>
                        {part.isMultiMaterial && (
                          <button 
                            onClick={() => addMaterialToPart(part.id)}
                            className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            Add
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence>
                        {part.materials.map(mat => (
                          <motion.div 
                            key={mat.id} 
                            layout={state.animationsEnabled?.layouts !== false}
                            initial={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                            animate={state.animationsEnabled?.layouts !== false ? { opacity: 1, scale: 1 } : false}
                            exit={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                            className="p-3 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 rounded-xl relative"
                          >
                            {part.isMultiMaterial && part.materials.length > 1 && (
                              <button 
                                onClick={() => removeMaterialFromPart(part.id, mat.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100/80 text-red-600 hover:bg-red-200/90 rounded-full flex items-center justify-center transition-all shadow-sm border border-red-200/50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type/Spool</label>
                                <SpoolCombobox 
                                  value={mat.spoolId || mat.name}
                                  spools={state.spools || []}
                                  onChange={(spoolId, name, costPerKg) => {
                                    if (spoolId) {
                                      handlePartMaterialUpdate(part.id, mat.id, { 
                                        spoolId, 
                                        name,
                                        costPerKg 
                                      });
                                    } else {
                                      handlePartMaterialUpdate(part.id, mat.id, { 
                                        spoolId: undefined, 
                                        name 
                                      });
                                    }
                                  }}
                                  className="w-full px-2 py-1.5 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-xs text-slate-800 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Cost/KG</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    value={mat.costPerKg || ''} 
                                    onChange={(e) => handlePartMaterialChange(part.id, mat.id, 'costPerKg', parseFloat(e.target.value) || 0)} 
                                    disabled={!!mat.spoolId}
                                    className={`w-full pl-2 pr-7 py-1.5 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-xs text-slate-800 dark:text-white ${mat.spoolId ? 'opacity-70 cursor-not-allowed' : ''}`} 
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">CAD</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Weight</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    value={mat.weight || ''} 
                                    onChange={(e) => handlePartMaterialChange(part.id, mat.id, 'weight', parseFloat(e.target.value) || 0)} 
                                    className="w-full pl-2 pr-6 py-1.5 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-xs text-slate-800 dark:text-white" 
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">g</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* PRINTING TIME */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Printing Time</label>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <input 
                            type="number" 
                            value={part.printTimeHrs || ''} 
                            onChange={(e) => handlePartChange(part.id, 'printTimeHrs', parseInt(e.target.value) || 0)} 
                            className="w-full pl-3 pr-10 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all text-sm text-slate-800 dark:text-white" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">hrs</span>
                        </div>
                        <div className="relative flex-1">
                          <input 
                            type="number" 
                            value={part.printTimeMin || ''} 
                            onChange={(e) => handlePartChange(part.id, 'printTimeMin', parseInt(e.target.value) || 0)} 
                            className="w-full pl-3 pr-10 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all text-sm text-slate-800 dark:text-white" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">min</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Printer</label>
                      <select 
                        value={part.printerId || ''} 
                        onChange={(e) => handlePartChange(part.id, 'printerId', e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all text-sm text-slate-800 dark:text-white"
                      >
                        <option value="">Default Settings</option>
                        {state.printers && state.printers.map(printer => (
                          <option key={printer.id} value={printer.id}>{printer.name} ({printer.model})</option>
                        ))}
                      </select>
                    </div>

                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Post-Processing Tasks Section */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 dark:border-slate-700/60 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </div>
              Post-Processing Tasks
            </h2>
            <button 
              onClick={addPostProcessingTask}
              className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-200/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add Task
            </button>
          </div>

          <div className="space-y-3">
            {state.postProcessingTasks?.length > 0 ? (
              <AnimatePresence>
              {state.postProcessingTasks.map((task) => (
                <motion.div 
                  key={task.id} 
                  layout={state.animationsEnabled?.layouts !== false}
                  initial={state.animationsEnabled?.layouts !== false ? { opacity: 0, x: -10 } : false}
                  animate={state.animationsEnabled?.layouts !== false ? { opacity: 1, x: 0 } : false}
                  exit={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                  className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white/60 dark:border-slate-700/60"
                >
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={task.name} 
                      onChange={(e) => handlePostProcessingTaskChange(task.id, 'name', e.target.value)}
                      placeholder="Task Name (e.g., Sanding)" 
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="w-32 relative">
                    <input 
                      type="number" 
                      value={task.timeMin || ''} 
                      onChange={(e) => handlePostProcessingTaskChange(task.id, 'timeMin', parseInt(e.target.value) || 0)}
                      className="w-full pl-3 pr-10 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">min</span>
                  </div>
                  <button 
                    onClick={() => removePostProcessingTask(task.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-6 bg-white/30 dark:bg-slate-800/40 rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                <p className="text-sm text-slate-500 dark:text-slate-400">No post-processing tasks added.</p>
              </div>
            )}
          </div>
        </div>

        {/* Extra Items Section */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 dark:border-slate-700/60 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              </div>
              Extra Items (Keychains, etc.)
            </h2>
            <div className="flex items-center gap-2">
              {state.inventoryExtraItems && state.inventoryExtraItems.length > 0 && (
                <button
                  onClick={() => setShowExtraItemsModal(true)}
                  className="text-xs text-slate-600 dark:text-slate-300 font-medium hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-white/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/50 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  From Inventory
                </button>
              )}
              <button 
                onClick={addExtraItem}
                className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-200/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Custom Item
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {state.extraItems?.length > 0 ? (
              <AnimatePresence>
              {state.extraItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout={state.animationsEnabled?.layouts !== false}
                  initial={state.animationsEnabled?.layouts !== false ? { opacity: 0, x: -10 } : false}
                  animate={state.animationsEnabled?.layouts !== false ? { opacity: 1, x: 0 } : false}
                  exit={state.animationsEnabled?.layouts !== false ? { opacity: 0, scale: 0.95 } : false}
                  className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white/60 dark:border-slate-700/60"
                >
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleExtraItemChange(item.id, 'name', e.target.value)}
                      placeholder="Item Name (e.g., Keychain Ring)" 
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="w-24 relative">
                    <input 
                      type="number" 
                      value={item.quantity || ''} 
                      onChange={(e) => handleExtraItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs">x</span>
                  </div>
                  <div className="w-32 relative">
                    <input 
                      type="number" 
                      value={item.price || ''} 
                      onChange={(e) => handleExtraItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm text-slate-800 dark:text-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">$</span>
                  </div>
                  <button 
                    onClick={() => removeExtraItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-6 bg-white/30 dark:bg-slate-800/40 rounded-2xl border border-white/40 dark:border-slate-700/40 border-dashed">
                <p className="text-sm text-slate-500 dark:text-slate-400">No extra items added.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* LABOR TIME */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Labor Time</label>
            <div className="relative">
              <input type="number" name="laborTimeMin" value={state.laborTimeMin || ''} onChange={handleChange} className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">min</span>
            </div>
          </div>
          {/* APPLY TAXES */}
          <div className="flex items-center h-[50px] mb-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="applyTaxes" 
                  checked={state.applyTaxes !== false} 
                  onChange={handleChange} 
                  className="sr-only text-slate-800 dark:text-white" 
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${state.applyTaxes !== false ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white dark:bg-slate-800 w-4 h-4 rounded-full transition-transform ${state.applyTaxes !== false ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none group-hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Apply Taxes</span>
            </label>
          </div>
          
          {/* IN-HOUSE JOB */}
          <div className="flex items-center h-[50px] mb-1">
            <label className="flex items-center gap-3 cursor-pointer group" title="In-House jobs have a final price of $0 but still track material/machine costs.">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="isInHouseJob" 
                  checked={state.isInHouseJob === true} 
                  onChange={handleChange} 
                  className="sr-only text-slate-800 dark:text-white" 
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${state.isInHouseJob === true ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white dark:bg-slate-800 w-4 h-4 rounded-full transition-transform ${state.isInHouseJob === true ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none group-hover:text-slate-900 dark:hover:text-slate-50 transition-colors">In-House / Free Job</span>
            </label>
          </div>

          {/* GST RATE */}
          <div className={state.applyTaxes === false ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">GST Rate (QC)</label>
            <div className="relative">
              <input type="number" name="gstRate" value={state.gstRate || ''} readOnly className="w-full pl-4 pr-12 py-3 bg-white/30 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/40 rounded-2xl focus:outline-none cursor-not-allowed transition-all shadow-inner text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">%</span>
            </div>
          </div>
          {/* QST RATE */}
          <div className={state.applyTaxes === false ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">QST Rate (QC)</label>
            <div className="relative">
              <input type="number" name="qstRate" value={state.qstRate || ''} readOnly className="w-full pl-4 pr-12 py-3 bg-white/30 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/40 rounded-2xl focus:outline-none cursor-not-allowed transition-all shadow-inner text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* HARDWARE COST */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Hardware Cost</label>
            <div className="relative">
              <input type="number" name="hardwareCost" value={state.hardwareCost || ''} onChange={handleChange} className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">CAD</span>
            </div>
          </div>

          {/* PACKAGING COST */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Packaging Cost</label>
            <div className="relative">
              <input type="number" name="packagingCost" value={state.packagingCost || ''} onChange={handleChange} className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">CAD</span>
            </div>
          </div>
          
          {/* SHIPPING COST */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Shipping Cost</label>
            <div className="relative">
              <input type="number" name="shippingCost" value={state.shippingCost || ''} onChange={handleChange} className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">CAD</span>
            </div>
          </div>
          
          {/* DISCOUNT */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Discount</label>
            <div className="relative flex">
              <select
                name="discountType"
                value={state.discountType}
                onChange={handleChange}
                className="w-1/3 pl-3 pr-2 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-l-2xl border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 appearance-none text-sm font-medium text-slate-800 dark:text-white"
              >
                <option value="percentage">%</option>
                <option value="fixed">$</option>
              </select>
              <input 
                type="number" 
                name="discountValue" 
                value={state.discountValue || ''} 
                onChange={handleChange} 
                className="w-2/3 pl-4 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white" 
              />
            </div>
          </div>
        </div>
        
        {/* INVOICE SETTINGS */}
        <div className="pt-4 border-t border-white/30 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Payment Terms</label>
            <select
              name="paymentTerms"
              value={state.paymentTerms}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 appearance-none text-slate-800 dark:text-white"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Invoice Notes</label>
            <textarea
              name="invoiceNotes"
              value={state.invoiceNotes || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 resize-none text-sm text-slate-800 dark:text-white"
              placeholder="Thank you for your business!..."
            ></textarea>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-4 border-t border-white/30 dark:border-slate-700/50">
          <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowAdvanced(!showAdvanced)}>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">Advanced Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure advanced parameters like electricity costs and depreciation.</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          </div>
          
          {showAdvanced && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Electricity Cost ($/kWh)</label>
                  <input type="number" step="0.01" name="electricityCost" value={state.electricityCost} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Printer Power (W)</label>
                  <input type="number" name="printerPower" value={state.printerPower} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Labor Rate ($/hr)</label>
                  <input type="number" name="laborRatePerHour" value={state.laborRatePerHour} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Failure Rate (%)</label>
                  <input type="number" name="failureRate" value={state.failureRate} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Default Printer Cost ($)</label>
                  <input type="number" name="printerCost" value={state.printerCost} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Printer Lifespan (hrs)</label>
                  <input type="number" name="printerLifespanHours" value={state.printerLifespanHours} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Markup (%)</label>
                  <input type="number" name="markupPercentage" value={state.markupPercentage} onChange={handleChange} className="w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 text-sm transition-all duration-300 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {showCustomerModal && (
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
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-md flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm">
                      {editingCustomerId ? 'Edit Customer' : 'Add New Customer'}
                    </h3>
                    {!editingCustomerId && (
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        #{state.nextClientNumber.toString().padStart(6, '0')}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setShowCustomerModal(false);
                      setEditingCustomerId(null);
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Customer Name</label>
                <input 
                  type="text" 
                  value={newCustomerName} 
                  onChange={e => setNewCustomerName(e.target.value)} 
                  autoFocus
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  value={newCustomerStreet} 
                  onChange={e => setNewCustomerStreet(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                  placeholder="123 3D Street" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={newCustomerCity} 
                    onChange={e => setNewCustomerCity(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                    placeholder="Maker City" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">State/Province</label>
                  <input
                    type="text"
                    value={newCustomerState} 
                    onChange={e => setNewCustomerState(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                    placeholder="Quebec" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={newCustomerZip} 
                    onChange={e => setNewCustomerZip(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                    placeholder="H3Z 2Y7" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    value={newCustomerCountry} 
                    onChange={e => setNewCustomerCountry(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/70 dark:focus:bg-slate-700/50 transition-all duration-300 text-slate-800 dark:text-white"
                    placeholder="Canada" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowCustomerModal(false);
                  setEditingCustomerId(null);
                  setNewCustomerName('');
                  setNewCustomerStreet('');
                  setNewCustomerCity('');
                  setNewCustomerState('Quebec');
                  setNewCustomerZip('');
                  setNewCustomerCountry('Canada');
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-200 font-medium hover:bg-white/50 dark:bg-slate-800/50 border border-transparent hover:border-white/60 dark:border-slate-700/60 rounded-xl transition-all duration-300 text-slate-800 dark:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newCustomerName.trim()) return;
                  
                  if (editingCustomerId) {
                    const updatedCustomers = state.customers.map(c => 
                      c.id === editingCustomerId ? {
                        ...c,
                        name: newCustomerName.trim(), 
                        street: newCustomerStreet.trim(),
                        city: newCustomerCity.trim(),
                        state: newCustomerState.trim(),
                        zip: newCustomerZip.trim(),
                        country: newCustomerCountry.trim(),
                      } : c
                    );
                    updateState({ customers: updatedCustomers });
                  } else {
                    const clientNumber = state.nextClientNumber.toString().padStart(6, '0');
                    const newCustomer = { 
                      id: Math.random().toString(), 
                      clientNumber,
                      name: newCustomerName.trim(), 
                      street: newCustomerStreet.trim(),
                      city: newCustomerCity.trim(),
                      state: newCustomerState.trim(),
                      zip: newCustomerZip.trim(),
                      country: newCustomerCountry.trim(),
                    };
                    updateState({ 
                      customers: [...state.customers, newCustomer],
                      selectedCustomerId: newCustomer.id,
                      nextClientNumber: state.nextClientNumber + 1
                    });
                  }
                  
                  setShowCustomerModal(false);
                  setEditingCustomerId(null);
                  setNewCustomerName('');
                  setNewCustomerStreet('');
                  setNewCustomerCity('');
                  setNewCustomerState('Quebec');
                  setNewCustomerZip('');
                  setNewCustomerCountry('Canada');
                }}
                disabled={!newCustomerName.trim()}
                className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/90 text-white font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)] border border-blue-400/50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCustomerId ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showManageCustomersModal && (
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm">Manage Customers</h3>
                  <button 
                    onClick={() => setShowManageCustomersModal(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {state.customers.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">No customers found.</div>
              ) : (
                state.customers.map(c => (
                  <div key={c.id} className="bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {c.name} 
                        {c.clientNumber && <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">#{c.clientNumber}</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {[c.street, c.city, c.state, c.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCustomerId(c.id);
                          setNewCustomerName(c.name);
                          setNewCustomerStreet(c.street || '');
                          setNewCustomerCity(c.city || '');
                          setNewCustomerState(c.state || '');
                          setNewCustomerZip(c.zip || '');
                          setNewCustomerCountry(c.country || '');
                          setShowCustomerModal(true);
                          setShowManageCustomersModal(false);
                        }}
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Customer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
                            updateState({
                              customers: state.customers.filter(cust => cust.id !== c.id),
                              selectedCustomerId: state.selectedCustomerId === c.id ? null : state.selectedCustomerId
                            });
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Customer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
              <button
                onClick={() => setShowManageCustomersModal(false)}
                className="px-6 py-2.5 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:bg-slate-200 text-white rounded-xl font-medium transition-all shadow-md active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
      {/* Extra Items Modal */}
      {createPortal(
        <AnimatePresence>
          {showExtraItemsModal && (
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                    Select Extra Item
                  </h3>
                  <button 
                    onClick={() => setShowExtraItemsModal(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.inventoryExtraItems?.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    addInventoryExtraItem(item.id);
                    setShowExtraItemsModal(false);
                  }}
                  className="bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm hover:bg-white/70 dark:hover:bg-slate-700/50 hover:border-purple-300 p-4 rounded-2xl flex justify-between items-center transition-all text-left group"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="p-2 bg-purple-500/10 text-purple-600 border border-purple-200/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
              <button
                onClick={() => setShowExtraItemsModal(false)}
                className="px-6 py-2.5 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:bg-slate-200 text-white rounded-xl font-medium transition-all shadow-md active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
      {createPortal(
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Clear Form</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Are you sure you want to clear the form? All unsaved changes will be lost.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeClearForm}
                    className="px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
