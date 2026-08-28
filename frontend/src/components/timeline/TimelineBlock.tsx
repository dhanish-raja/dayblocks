import React from 'react';
import { formatTime, contentPreview, isBlockActive } from '@/utils';
import { CheckCircle, Circle, Coffee, Edit3, Trash2, Tag, Smile } from 'lucide-react';
import type { TimeBlock } from '@/types';
import { clsx } from 'clsx';

interface TimelineBlockProps {
  block: TimeBlock;
  onSelect: (block: TimeBlock) => void;
  onToggleComplete?: (block: TimeBlock) => void;
  onDelete?: (blockId: string) => void;
}

export function TimelineBlock({ block, onSelect, onToggleComplete, onDelete }: TimelineBlockProps) {
  const active = isBlockActive(block.startTime, block.endTime);

  const getStyleClass = () => {
    if (block.type === 'BREAK') return 'block-break';
    if (block.type === 'CUSTOM') return 'block-custom';
    return 'block-journal';
  };

  const getBadgeColor = () => {
    if (block.type === 'BREAK') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    if (block.type === 'CUSTOM') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    return 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300';
  };

  return (
    <div
      onClick={() => onSelect(block)}
      className={clsx(
        'card p-4 transition-all duration-200 cursor-pointer group relative hover:shadow-card-hover',
        getStyleClass(),
        block.completed && 'opacity-75',
        active && 'ring-2 ring-brand-500 shadow-md'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Status Checkbox */}
          {block.type !== 'BREAK' && onToggleComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(block);
              }}
              className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
              title={block.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {block.completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          )}

          {block.type === 'BREAK' && <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />}

          {/* Time range */}
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {formatTime(block.startTime)} – {formatTime(block.endTime)}
          </span>

          <span className={clsx('text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full', getBadgeColor())}>
            {block.type}
          </span>

          {active && (
            <span className="animate-pulse text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-2 py-0.5 rounded-full">
              NOW
            </span>
          )}
        </div>

        {/* Delete action */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition rounded"
            title="Delete Block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Block Title */}
      <h3 className={clsx(
        'font-semibold text-base text-slate-900 dark:text-slate-100',
        block.completed && 'line-through text-slate-500 dark:text-slate-400'
      )}>
        {block.title || (block.type === 'BREAK' ? 'Break' : 'Untitled Block')}
      </h3>

      {/* Content preview */}
      {block.content && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {contentPreview(block.content, 140)}
        </p>
      )}

      {/* Mood & Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
        {block.mood && (
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            <Smile className="w-3 h-3 text-amber-500" />
            <span className="capitalize">{block.mood}</span>
          </span>
        )}

        {block.tags && block.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
            <Tag className="w-2.5 h-2.5" />
            <span>#{tag}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
