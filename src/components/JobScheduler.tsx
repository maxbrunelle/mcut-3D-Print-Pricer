import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Trash2, Printer as PrinterIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAppContext, ScheduledJob, Invoice, Printer } from '../lib/store';

interface JobToSchedule {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  partId: string;
  partName: string;
  printTimeHrs: number;
  printTimeMin: number;
  totalDurationMin: number;
  customerName: string;
  isInHouseJob: boolean;
}

export function JobScheduler() {
  const { state, updateState } = useAppContext();
  const [selectedJob, setSelectedJob] = useState<JobToSchedule | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  // Using global state for inspectingInvoiceId instead of local
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const invoices = state.invoices || [];
  const scheduledJobs = state.scheduledJobs || [];
  const printers = state.printers || [];

  const jobsToSchedule = useMemo(() => {
    const jobs: JobToSchedule[] = [];
    invoices.filter(i => i.status === 'Pending' || i.status === 'In Progress').forEach(inv => {
      const parts = (inv.savedState?.parts || []).filter((p: any) => p.is3DPrinted !== false);
      parts.forEach((p: any) => {
        const jobId = `${inv.id}-${p.id}`;
        if (!scheduledJobs.find(sj => sj.partId === p.id && sj.invoiceId === inv.id)) {
          jobs.push({
            id: jobId,
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            partId: p.id,
            partName: p.name,
            printTimeHrs: p.printTimeHrs || 0,
            printTimeMin: p.printTimeMin || 0,
            totalDurationMin: (p.printTimeHrs || 0) * 60 + (p.printTimeMin || 0),
            customerName: inv.customerName,
            isInHouseJob: inv.isInHouseJob || false
          });
        }
      });
    });
    return jobs.sort((a, b) => b.totalDurationMin - a.totalDurationMin);
  }, [invoices, scheduledJobs]);

  const handleAssign = (job: JobToSchedule, date: string) => {
    if (printers.length === 0) return;
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    
    const endTime = new Date(startTime.getTime() + job.totalDurationMin * 60000);
    
    const newJob: ScheduledJob = {
      id: Date.now().toString(),
      printerId: printers[0].id,
      invoiceId: job.invoiceId,
      partId: job.partId,
      title: `${job.partName} (${job.invoiceNumber})`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    updateState({ scheduledJobs: [...scheduledJobs, newJob] });
    setSelectedJob(null);
  };

  const handleUnassign = (id: string) => {
    updateState({ scheduledJobs: scheduledJobs.filter(sj => sj.id !== id) });
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const days = [];
    
    for (let i = 0; i < totalCells; i++) {
      const isPrevMonth = i < firstDay;
      const isNextMonth = i >= firstDay + daysInMonth;
      
      let d = 0;
      let cellDateStr = '';
      let isToday = false;
      
      if (isPrevMonth) {
        d = daysInPrevMonth - firstDay + i + 1;
        const prevMonthDate = new Date(year, month - 1, d);
        cellDateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      } else if (isNextMonth) {
        d = i - firstDay - daysInMonth + 1;
        const nextMonthDate = new Date(year, month + 1, d);
        cellDateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      } else {
        d = i - firstDay + 1;
        cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        isToday = new Date().toISOString().split('T')[0] === cellDateStr;
      }
      
      const dayInvoices = invoices.filter(inv => inv.dueDate && inv.dueDate.split('T')[0] === cellDateStr);
      const dayJobs = scheduledJobs.filter(sj => sj.startTime.split('T')[0] === cellDateStr);
      
      const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
      };
      
      const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
      };
      
      const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
        const jobId = e.dataTransfer.getData('text/plain');
        const job = jobsToSchedule.find(j => j.id === jobId);
        if (job) {
          handleAssign(job, cellDateStr);
        }
      };

      days.push(
        <div 
          key={i} 
          className={`min-h-[100px] border-r border-b border-slate-200 dark:border-slate-800 flex flex-col p-1.5 transition-colors
            ${(isPrevMonth || isNextMonth) ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-white dark:bg-slate-900/80'}
            hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (selectedJob) {
              handleAssign(selectedJob, cellDateStr);
            }
          }}
        >
          <div className="flex justify-end mb-1">
             <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
               ${isToday ? 'bg-red-500 text-white shadow-sm' : 
                 (isPrevMonth || isNextMonth) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}
             `}>
               {d}
             </span>
          </div>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
            {dayInvoices.map(inv => (
              <div 
                key={inv.id} 
                className="text-[10px] px-1.5 py-0.5 bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded shadow-sm truncate cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                onClick={(e) => { e.stopPropagation(); updateState({ inspectingInvoiceId: inv.id }); }}
                title={`Due: ${inv.projectName || inv.partName}`}
              >
                <span className="opacity-70 mr-1 font-semibold">Due:</span>{inv.projectName || inv.partName}
              </div>
            ))}
            
            {dayJobs.map(sj => {
              return (
                <div 
                  key={sj.id} 
                  className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded shadow-sm truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                  onClick={(e) => { e.stopPropagation(); updateState({ inspectingInvoiceId: sj.invoiceId }); }}
                  title={sj.title}
                >
                  {sj.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col shrink-0 h-[300px] lg:h-auto gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm px-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h2 className="text-xl font-bold tracking-tight">Calendar</h2>
          </div>
          
          <div className="flex-1 flex flex-col border border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/20">
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between text-sm">
                Unscheduled Queue
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-0.5 px-2 rounded-full text-[10px] font-bold">
                  {jobsToSchedule.length}
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Drag a job to the calendar</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {jobsToSchedule.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  No pending jobs.
                </div>
              ) : (
                jobsToSchedule.map(job => (
                  <div 
                    key={job.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', job.id);
                      setSelectedJob(job);
                    }}
                    onDragEnd={() => setSelectedJob(null)}
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${selectedJob?.id === job.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'}`}
                  >
                    <div className="font-semibold text-xs mb-1 line-clamp-1 text-slate-800 dark:text-slate-200">{job.partName}</div>
                    <div className="text-[10px] flex justify-between text-slate-500 dark:text-slate-400">
                      <span>#{job.invoiceNumber}</span>
                      <span className="font-medium bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{job.printTimeHrs}h {job.printTimeMin}m</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calendar Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMonthPickerOpen(true)}
                className="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group min-w-[140px]"
              >
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200/50 dark:border-slate-700/50">
                <button onClick={prevMonth} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={goToday} className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
                  Today
                </button>
                <button onClick={nextMonth} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div><span className="text-slate-600 dark:text-slate-300">Job</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><span className="text-slate-600 dark:text-slate-300">Due Date</span></div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-900/50">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 last:border-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(100px,1fr)] overflow-y-auto">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>

      {isMonthPickerOpen && createPortal(
        <MonthPickerModal
          currentMonth={currentMonth}
          onClose={() => setIsMonthPickerOpen(false)}
          onSelect={(date) => {
            setCurrentMonth(date);
            setIsMonthPickerOpen(false);
          }}
          animationsEnabled={state.animationsEnabled?.popups !== false}
        />,
        document.body
      )}

      {state.inspectingInvoiceId && createPortal(
        <JobDetailsModal 
          invoiceId={state.inspectingInvoiceId!} 
          onClose={() => updateState({ inspectingInvoiceId: null })} 
          state={state} 
          updateState={updateState} 
          handleUnassign={handleUnassign}
        />,
        document.body
      )}
    </div>
  );
}

function JobDetailsModal({ invoiceId, onClose, state, updateState, handleUnassign }: any) {
  const invoice = state.invoices?.find((i: any) => i.id === invoiceId);
  if (!invoice) return null;
  const invoiceJobs = state.scheduledJobs?.filter((sj: any) => sj.invoiceId === invoiceId) || [];
  
  const handleUpdateDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newDate = e.target.value;
    if (newDate) {
      newDate = new Date(newDate).toISOString();
    }
    updateState({
      invoices: state.invoices.map((inv: any) => 
        inv.id === invoiceId ? { ...inv, dueDate: newDate } : inv
      )
    });
  };

  const animationsEnabled = state.animationsEnabled?.popups !== false;

  return (
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
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {invoice.projectName || invoice.partName} 
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  #{invoice.invoiceNumber}
                </span>
              </h3>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Customer</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{invoice.customerName || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Amount</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">${invoice.totalAmount?.toFixed(2)}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{invoice.status || 'Quoted'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/30">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-1.5">
                  <Calendar size={14} /> Due Date
                </div>
                <input 
                  type="date"
                  value={invoice.dueDate ? invoice.dueDate.split('T')[0] : ''}
                  onChange={handleUpdateDueDate}
                  className="min-w-0 max-w-full appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <PrinterIcon size={16} className="text-slate-500" />
                Parts & Requirements
              </h4>
              <div className="space-y-2">
                {invoice.savedState?.parts?.map((p: any) => (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {p.is3DPrinted !== false ? `3D Print ${p.printTimeHrs || 0}h ${p.printTimeMin || 0}m ` : 'Extra Item'}
                      </div>
                    </div>
                    <div className="text-sm font-medium shrink-0">
                      x{p.quantity || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                Scheduled Jobs for this Order
              </h4>
              
              {invoiceJobs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No jobs have been scheduled yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {invoiceJobs.map((job: any) => {
                    const printer = state.printers?.find((p: any) => p.id === job.printerId);
                    return (
                      <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{job.title}</div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(job.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <PrinterIcon size={12} />
                              {printer?.name || 'Unknown Printer'}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnassign(job.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Unschedule</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MonthPickerModal({ currentMonth, onClose, onSelect, animationsEnabled }: any) {
  const [year, setYear] = useState(currentMonth.getFullYear());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
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
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800 flex flex-col p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setYear(year - 1)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
              {year}
            </h3>
            <button onClick={() => setYear(year + 1)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected = currentMonth.getMonth() === index && currentMonth.getFullYear() === year;
              return (
                <button
                  key={month}
                  onClick={() => onSelect(new Date(year, index, 1))}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 border border-transparent'}`}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
