import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-100">{total}</p>
          <p className="text-xs text-slate-400 font-medium">Total Items</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-100">
            {completed}{' '}
            <span className="text-xs font-normal text-emerald-400">({completionPercent}%)</span>
          </p>
          <p className="text-xs text-slate-400 font-medium">Completed</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-100">{active}</p>
          <p className="text-xs text-slate-400 font-medium">In Progress</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-100">{highPriority}</p>
          <p className="text-xs text-slate-400 font-medium">High Priority</p>
        </div>
      </div>
    </div>
  );
};
