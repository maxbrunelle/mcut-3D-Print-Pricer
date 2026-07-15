const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('calendar');
  const [selectedJob, setSelectedJob] = useState<JobToSchedule | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const invoices = state.invoices || [];
  const scheduledJobs = state.scheduledJobs || [];
  const printers = state.printers || [];

  const jobsToSchedule = useMemo(() => {
    const jobs: JobToSchedule[] = [];
    invoices.filter(i => i.status === 'Pending' || i.status === 'In Progress').forEach(inv => {
      const parts = (inv.savedState?.parts || []).filter((p: any) => p.is3DPrinted !== false);
      parts.forEach((p: any) => {
        const jobId = \`\${inv.id}-\${p.id}\`;
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

  const handleAssign = (printerId: string, date: string) => {
    if (!selectedJob) return;
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    
    const endTime = new Date(startTime.getTime() + selectedJob.totalDurationMin * 60000);
    
    const newJob: ScheduledJob = {
      id: Date.now().toString(),
      printerId,
      invoiceId: selectedJob.invoiceId,
      partId: selectedJob.partId,
      title: \`\${selectedJob.partName} (\${selectedJob.invoiceNumber})\`,
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

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="min-h-[100px] border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20" />);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(d).padStart(2, '0')}\`;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      const dayInvoices = invoices.filter(inv => inv.dueDate && inv.dueDate.split('T')[0] === dateStr);
      const dayJobs = scheduledJobs.filter(sj => sj.startTime.split('T')[0] === dateStr);
      
      days.push(
        <div 
          key={d} 
          className={\`min-h-[100px] p-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 flex flex-col gap-1 overflow-y-auto \${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}\`}
          onClick={() => {
            if (selectedJob && printers.length > 0) {
              handleAssign(printers[0].id, dateStr);
            }
          }}
        >
          <div className={\`text-sm font-bold mb-1 \${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>{d}</div>
          
          {dayInvoices.map(inv => (
            <div key={inv.id} className="text-xs p-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded border border-green-200 dark:border-green-800 shadow-sm leading-tight">
              <strong>Due:</strong> {inv.projectName} <span className="opacity-70">(#{inv.invoiceNumber})</span>
            </div>
          ))}
          
          {dayJobs.map(sj => {
            const printer = printers.find(p => p.id === sj.printerId);
            return (
              <div 
                key={sj.id} 
                className="text-xs p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 shadow-sm leading-tight cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors group relative"
                onClick={(e) => { e.stopPropagation(); handleUnassign(sj.id); }}
              >
                <strong>{printer?.name || 'Printer'}:</strong> {sj.title}
                <div className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  Remove
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={nextMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-slate-500 dark:text-slate-400 mb-2">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/80 dark:border-slate-700/80 p-6 md:p-8 flex flex-col h-[calc(100vh-8rem)] animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 drop-shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h2 className="text-xl font-bold uppercase tracking-widest">Job Scheduler</h2>
        </div>
      </div>
      
      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Unscheduled Jobs Sidebar */}
        <div className="w-80 flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              Queue
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-0.5 px-2 rounded-full text-xs">
                {jobsToSchedule.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a job then click a day to schedule</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {jobsToSchedule.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                No pending jobs to schedule.
              </div>
            ) : (
              jobsToSchedule.map(job => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className={\`p-3 rounded-xl border cursor-pointer transition-all \${selectedJob?.id === job.id ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm'}\`}
                >
                  <div className="font-semibold text-sm mb-1 line-clamp-1">{job.partName}</div>
                  <div className={\`text-xs flex justify-between \${selectedJob?.id === job.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}\`}>
                    <span>#{job.invoiceNumber}</span>
                    <span>{job.printTimeHrs}h {job.printTimeMin}m</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Calendar Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/JobScheduler.tsx', code);
