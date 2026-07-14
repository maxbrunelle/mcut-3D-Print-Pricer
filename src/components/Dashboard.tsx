import React, { useState } from 'react';
import { useAppContext } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { AnimatedNumber } from './AnimatedNumber';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function Dashboard() {
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
  const invoices = state.invoices || [];

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalJobs = invoices.length;
  const completedJobs = invoices.filter(inv => inv.status === 'Completed').length;
  
  const completedRevenue = invoices
    .filter(inv => inv.status === 'Completed')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

  // Group by month
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { 
      month: d.toLocaleString('default', { month: 'short' }), 
      year: d.getFullYear(),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      revenue: 0,
      jobs: 0
    };
  }).reverse();

  invoices.forEach(inv => {
    const d = new Date(inv.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const monthData = last6Months.find(m => m.key === key);
    if (monthData) {
      monthData.revenue += inv.totalAmount;
      monthData.jobs += 1;
    }
  });

  // Status Distribution
  const statusCounts = invoices.reduce((acc, inv) => {
    const status = inv.status || 'Quoted';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    { name: 'Quoted', value: statusCounts['Quoted'] || 0, color: '#94a3b8' },
    { name: 'Printing', value: statusCounts['Printing'] || 0, color: '#3b82f6' },
    { name: 'Post-Processing', value: statusCounts['Post-Processing'] || 0, color: '#a855f7' },
    { name: 'Completed', value: statusCounts['Completed'] || 0, color: '#22c55e' }
  ].filter(item => item.value > 0);

  const lowSpools = (state.spools || []).filter(s => s.remainingWeight < 200);
  const lowItems = (state.inventoryExtraItems || []).filter(i => i.quantity < 5);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 shadow-sm text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-md font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Analytics Dashboard
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
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 w-full max-w-6xl max-h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-sm">Business Analytics</h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/50 dark:bg-slate-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                  </button>
                </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center">
                  <span className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Total Quoted
                  </span>
                  <AnimatedNumber 
                    value={totalRevenue} 
                    format={(v) => `${cSym}${v.toFixed(2)}`} 
                    className="text-3xl font-black text-slate-800 dark:text-slate-100" 
                    enabled={state.animationsEnabled?.numbers !== false}
                  />
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col justify-center">
                  <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Completed Revenue
                  </span>
                  <AnimatedNumber 
                    value={completedRevenue} 
                    format={(v) => `${cSym}${v.toFixed(2)}`} 
                    className="text-3xl font-black text-slate-800 dark:text-slate-100"
                    enabled={state.animationsEnabled?.numbers !== false}
                  />
                </div>
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex flex-col justify-center">
                  <span className="text-purple-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Total Jobs
                  </span>
                  <AnimatedNumber 
                    value={totalJobs} 
                    format={(v) => Math.round(v).toString()} 
                    className="text-3xl font-black text-slate-800 dark:text-slate-100"
                    enabled={state.animationsEnabled?.numbers !== false}
                  />
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex flex-col justify-center">
                  <span className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    Avg. Job Value
                  </span>
                  <AnimatedNumber 
                    value={averageJobValue} 
                    format={(v) => `${cSym}${v.toFixed(2)}`} 
                    className="text-3xl font-black text-slate-800 dark:text-slate-100"
                    enabled={state.animationsEnabled?.numbers !== false}
                  />
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    Revenue (Last 6 Months)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={last6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${cSym}${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    Jobs by Status
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Jobs Bar Chart & Top Customers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/></svg>
                    Job Volume (Last 6 Months)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={last6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="jobs" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Jobs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Top Customers
                  </h3>
                  <div className="flex-1 overflow-y-auto">
                    {Object.values(
                      invoices.reduce((acc, inv) => {
                        const name = inv.customerName || 'Unknown';
                        if (!acc[name]) acc[name] = { name, revenue: 0, jobs: 0 };
                        acc[name].revenue += inv.totalAmount;
                        acc[name].jobs += 1;
                        return acc;
                      }, {} as Record<string, { name: string, revenue: number, jobs: number }>)
                    )
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((cust, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{cust.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{cust.jobs} job{cust.jobs !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{cSym}{cust.revenue.toFixed(2)}</div>
                        </div>
                      ))}
                      {invoices.length === 0 && (
                        <div className="text-sm text-slate-400 text-center py-8">
                          No customer data yet.
                        </div>
                      )}
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