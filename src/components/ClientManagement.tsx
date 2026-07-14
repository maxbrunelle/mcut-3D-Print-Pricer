import React, { useState } from 'react';
import { useAppContext, Customer } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { AnimatedNumber } from './AnimatedNumber';

export function ClientManagementContent() {
  const { state, updateState } = useAppContext();
  
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerStreet, setNewCustomerStreet] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('');
  const [newCustomerState, setNewCustomerState] = useState('Quebec');
  const [newCustomerZip, setNewCustomerZip] = useState('');
  const [newCustomerCountry, setNewCustomerCountry] = useState('Canada');

  const getCurrencySymbol = (code: string | undefined) => {
    switch (code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  const cSym = getCurrencySymbol(state.currency);

  const startEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setIsEditing(true);
    setNewCustomerName(c.name);
    setNewCustomerStreet(c.street || '');
    setNewCustomerCity(c.city || '');
    setNewCustomerState(c.state || '');
    setNewCustomerZip(c.zip || '');
    setNewCustomerCountry(c.country || '');
  };

  const startNew = () => {
    setSelectedCustomer(null);
    setIsEditing(true);
    setNewCustomerName('');
    setNewCustomerStreet('');
    setNewCustomerCity('');
    setNewCustomerState('Quebec');
    setNewCustomerZip('');
    setNewCustomerCountry('Canada');
  };

  const saveCustomer = () => {
    if (!newCustomerName.trim()) return;
    
    if (selectedCustomer) {
      const updatedCustomers = state.customers.map(c => 
        c.id === selectedCustomer.id ? {
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
      setSelectedCustomer(updatedCustomers.find(c => c.id === selectedCustomer.id) || null);
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
        nextClientNumber: state.nextClientNumber + 1
      });
      setSelectedCustomer(newCustomer);
    }
    setIsEditing(false);
  };

  const deleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      updateState({
        customers: state.customers.filter(cust => cust.id !== id),
        selectedCustomerId: state.selectedCustomerId === id ? null : state.selectedCustomerId
      });
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  const customerInvoices = selectedCustomer ? state.invoices.filter(i => i.customerName === selectedCustomer.name) : [];
  const totalLTV = customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

return (
<div className="flex-1 overflow-hidden flex flex-col h-full">

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Client List */}
                  <div className="col-span-1 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-4 flex flex-col bg-white/40 dark:bg-slate-800/40">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200">Clients ({state.customers.length})</h3>
                      <button 
                        onClick={startNew}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-sm"
                        title="New Client"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-2">
                      {state.customers.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">No clients found.</div>
                      ) : (
                        state.customers.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => { setSelectedCustomer(c); setIsEditing(false); }}
                            className={`p-3 rounded-2xl cursor-pointer transition-all border ${selectedCustomer?.id === c.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 shadow-sm' : 'bg-white/60 dark:bg-slate-800/60 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className={`font-bold ${selectedCustomer?.id === c.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>{c.name}</div>
                                {c.clientNumber && <div className="text-xs text-slate-500">#{c.clientNumber}</div>}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteCustomer(c.id, c.name); }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Client Details / Order History */}
                  <div className="col-span-1 lg:col-span-2 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 flex flex-col bg-white/40 dark:bg-slate-800/40 overflow-y-auto custom-scrollbar">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer ? 'Edit Client' : 'New Client'}</h3>
                          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Company / Name</label>
                            <input
                              type="text"
                              value={newCustomerName}
                              onChange={e => setNewCustomerName(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                              placeholder="e.g. Acme Corp"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Street Address</label>
                            <input
                              type="text"
                              value={newCustomerStreet}
                              onChange={e => setNewCustomerStreet(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">City</label>
                            <input
                              type="text"
                              value={newCustomerCity}
                              onChange={e => setNewCustomerCity(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">State / Province</label>
                            <input
                              type="text"
                              value={newCustomerState}
                              onChange={e => setNewCustomerState(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">ZIP / Postal Code</label>
                            <input
                              type="text"
                              value={newCustomerZip}
                              onChange={e => setNewCustomerZip(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Country</label>
                            <input
                              type="text"
                              value={newCustomerCountry}
                              onChange={e => setNewCustomerCountry(e.target.value)}
                              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={saveCustomer}
                            disabled={!newCustomerName.trim()}
                            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                          >
                            Save Client
                          </button>
                        </div>
                      </div>
                    ) : selectedCustomer ? (
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</h3>
                            <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              LTV: {cSym}{totalLTV.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 font-mono text-sm">Client #{selectedCustomer.clientNumber}</div>
                          
                          {(selectedCustomer.street || selectedCustomer.city) && (
                            <div className="mt-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex gap-3 text-slate-600 dark:text-slate-300 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                              <div>
                                <div>{selectedCustomer.street}</div>
                                <div>{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zip}</div>
                                <div>{selectedCustomer.country}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Order History
                          </h4>
                          
                          {customerInvoices.length === 0 ? (
                            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                              No orders for this client yet.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {customerInvoices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(inv => (
                                <div key={inv.id} className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex justify-between items-center hover:shadow-md transition-shadow">
                                  <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{inv.partName}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{inv.invoiceNumber}</span>
                                      <span>{new Date(inv.date).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-slate-800 dark:text-slate-100">{cSym}{inv.totalAmount.toFixed(2)}</div>
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                      inv.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                      inv.status === 'Printing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                      inv.status === 'Post-Processing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                      {inv.status || 'Quoted'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <p className="text-lg font-medium">Select a client</p>
                        <p className="text-sm">Choose a client from the list to view their details and order history.</p>
                      </div>
                    )}
                  </div>
                </div>

</div>
  );
}
