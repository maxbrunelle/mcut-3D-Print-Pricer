import React, { useState } from 'react';
import { useAppContext, Customer, Invoice } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, MapPin, Search, FileText, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';

export function CustomersView() {
  const { state, updateState } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const customers = state.customers || [];
  const invoices = state.invoices || [];

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.clientNumber && c.clientNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const customerInvoices = selectedCustomer 
    ? invoices.filter(inv => inv.customerName === selectedCustomer.name)
    : [];

  const handleSave = () => {
    if (!formData.name) {
      alert("Customer name is required.");
      return;
    }
    
    let updatedCustomers = [...customers];
    
    if (isEditing && formData.id) {
      const idx = updatedCustomers.findIndex(c => c.id === formData.id);
      if (idx !== -1) {
        // If name changed, update invoices? Let's assume we don't for now or we just update the name
        updatedCustomers[idx] = { ...updatedCustomers[idx], ...formData } as Customer;
      }
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        clientNumber: String(state.nextClientNumber || 1000).padStart(4, '0'),
        name: formData.name || '',
        street: formData.street || '',
        city: formData.city || '',
        state: formData.state || '',
        zip: formData.zip || '',
        country: formData.country || 'Canada'
      };
      updatedCustomers.push(newCustomer);
      updateState({ nextClientNumber: (state.nextClientNumber || 1000) + 1 });
    }
    
    updateState({ customers: updatedCustomers });
    setShowModal(false);
    if (isEditing && selectedCustomer?.id === formData.id) {
      setSelectedCustomer(updatedCustomers.find(c => c.id === formData.id) || null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setFormData({ ...customer });
    setIsEditing(true);
    setShowModal(true);
  };
  
  const handleAddClick = () => {
    setFormData({
      country: 'Canada',
      state: 'Quebec'
    });
    setIsEditing(false);
    setShowModal(true);
  };

  if (selectedCustomer) {
    return (
      <div className="h-full flex flex-col space-y-6">
        <button 
          onClick={() => setSelectedCustomer(null)}
          className="self-start flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl transition-all shadow-sm border border-white/60 dark:border-slate-700/60"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-sm md:w-1/3 shrink-0 self-start">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">#{selectedCustomer.clientNumber}</span>
              </div>
              <button 
                onClick={(e) => handleEditClick(e, selectedCustomer)}
                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                title="Edit Customer"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <div>{selectedCustomer.street || 'No street address'}</div>
                  <div>{selectedCustomer.city}{selectedCustomer.city && selectedCustomer.state ? ', ' : ''}{selectedCustomer.state} {selectedCustomer.zip}</div>
                  <div>{selectedCustomer.country}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{customerInvoices.length}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Quotes</div>
              </div>
              <div className="bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Spent</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Sales History
            </h3>
            
            {customerInvoices.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 py-12">
                 <FileText size={48} className="opacity-20 mb-4" />
                 <p>No invoices or jobs found for this customer.</p>
               </div>
            ) : (
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {customerInvoices.map(inv => (
                  <div key={inv.id} className="bg-white/60 dark:bg-slate-700/50 p-4 rounded-xl border border-white/80 dark:border-slate-600/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{inv.partName}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{new Date(inv.date).toLocaleDateString()}</span>
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">#{inv.invoiceNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium \${
                          inv.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          inv.status === 'Quoted' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {inv.status || 'Quoted'}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-slate-800 dark:text-slate-100">
                      ${inv.totalAmount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <CustomerModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          isEditing={isEditing}
          animationsEnabled={state.animationsEnabled?.popups !== false}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all text-slate-800 dark:text-white"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] whitespace-nowrap"
        >
          <Plus size={18} />
          New Customer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {customers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl border border-dashed border-white/60 dark:border-slate-700/60">
            <UsersPlaceholder className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No customers yet</p>
            <p className="text-sm mt-1">Add your first customer to start tracking sales.</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl border border-dashed border-white/60 dark:border-slate-700/60">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No customers match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50 transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{customer.name}</h3>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">#{customer.clientNumber}</div>
                  </div>
                  <button 
                    onClick={(e) => handleEditClick(e, customer)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                  {customer.city ? `${customer.city}, ${customer.state}` : 'No location specified'}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-500 dark:text-slate-400">
                    {invoices.filter(i => i.customerName === customer.name).length} Orders
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isEditing={isEditing}
        animationsEnabled={state.animationsEnabled?.popups !== false}
      />
    </div>
  );
}

function UsersPlaceholder({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function CustomerModal({ isOpen, onClose, formData, setFormData, onSave, isEditing, animationsEnabled }: any) {
  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div 
        initial={animationsEnabled ? { opacity: 0 } : false}
        animate={animationsEnabled ? { opacity: 1 } : false}
        exit={animationsEnabled ? { opacity: 0 } : false}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
        <motion.div 
          initial={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
          animate={animationsEnabled ? { scale: 1, opacity: 1 } : false}
          exit={animationsEnabled ? { scale: 0.95, opacity: 0 } : false}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Company/Name *</label>
              <input 
                autoFocus
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                value={formData.street || ''}
                onChange={e => setFormData({ ...formData, street: e.target.value })}
                placeholder="123 Tech Lane"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Montreal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">State/Province</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  value={formData.state || ''}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="QC"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">ZIP/Postal Code</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  value={formData.zip || ''}
                  onChange={e => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="H2X 1Y4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  value={formData.country || ''}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Canada"
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
            >
              {isEditing ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
