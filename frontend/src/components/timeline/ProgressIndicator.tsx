import React from 'react';
import { formatTime, dayProgress } from '@/utils';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { TimeBlock } from '@/types';

interface ProgressIndicatorProps {
  startTime: string;
  endTime: string;
  blocks: TimeBlock[];
}

export function ProgressIndicator({ startTime, endTime, blocks }: ProgressIndicatorProps) {
  const elapsedPercent = dayProgress(startTime, endTime);
  
  const journalBlocks = blocks.filter(b => b.type === 'JOURNAL');
  const completedBlocks = journalBlocks.filter(b => b.completed).length;
  const completionPercent = journalBlocks.length > 0
    ? Math.round((completedBlocks / journalBlocks.length) * 100)
    : 0;

  return (
    <div className="card p-4 space-y-3 my-4 border-l-4 border-l-brand-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Clock className="w-4 h-4 text-brand-500" />
          <span className="font-semibold">{formatTime(startTime)}</span>
          <span className="text-slate-400">─────────────────</span>
          <span className="font-semibold">{formatTime(endTime)}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedBlocks} / {journalBlocks.length} Completed ({completionPercent}%)</span>
          </div>
          <span className="font-mono text-brand-600 dark:text-brand-400">{elapsedPercent}% Day Elapsed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-brand-500 transition-all duration-500 rounded-full"
          style={{ width: `${elapsedPercent}%` }}
        />
      </div>
    </div>
  );
}
