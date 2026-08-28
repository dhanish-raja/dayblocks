import React from 'react';
import { TimelineBlock } from './TimelineBlock';
import type { TimeBlock } from '@/types';
import { formatTime } from '@/utils';

interface TimelineProps {
  blocks: TimeBlock[];
  onSelectBlock: (block: TimeBlock) => void;
  onToggleComplete?: (block: TimeBlock) => void;
  onDeleteBlock?: (blockId: string) => void;
}

export function Timeline({ blocks, onSelectBlock, onToggleComplete, onDeleteBlock }: TimelineProps) {
  if (blocks.length === 0) {
    return (
      <div className="card p-12 text-center my-6">
        <p className="text-slate-500 dark:text-slate-400">No time blocks generated yet for this date.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Click "Setup Timeline" above to configure your day.
        </p>
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {/* Central vertical spine (Desktop) */}
      <div className="hidden sm:block absolute left-24 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} className="relative flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Timestamp label on spine */}
            <div className="sm:w-20 text-left sm:text-right shrink-0 pt-3">
              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                {formatTime(block.startTime)}
              </span>
            </div>

            {/* Node dot on line */}
            <div className="hidden sm:flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#0f1117] border-2 border-brand-500 shrink-0 mt-3 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            </div>

            {/* Block Card */}
            <div className="flex-1">
              <TimelineBlock
                block={block}
                onSelect={onSelectBlock}
                onToggleComplete={onToggleComplete}
                onDelete={onDeleteBlock}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
