import React, { useState, useEffect } from 'react';
import { daysApi } from '@/api';
import { todayString, formatDate } from '@/utils';
import type { Day, TimeBlock } from '@/types';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { BookOpen, Calendar, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Journal() {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

  useEffect(() => {
    daysApi
      .list()
      .then((res) => setDays(res))
      .catch(() => toast.error('Failed to load journal entries'))
      .finally(() => setLoading(false));
  }, []);

  const handleBlockUpdated = (updated: TimeBlock) => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        blocks: day.blocks ? day.blocks.map((b) => (b.id === updated.id ? updated : b)) : [],
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Journal Log</h1>
        <p className="text-xs text-slate-500 mt-1">Browse all your previous entries chronologically</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : days.length === 0 ? (
        <div className="card p-12 text-center my-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No journal entries found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <div key={day.id} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#2a3347] pb-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                  {formatDate(day.date.split('T')[0], 'EEEE, MMMM d, yyyy')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {day.blocks && day.blocks.length > 0 ? (
                  day.blocks
                    .filter((b) => b.type !== 'BREAK')
                    .map((block) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className="card p-4 hover:shadow-card-hover transition cursor-pointer border-l-4 border-l-brand-500"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {block.startTime} – {block.endTime}
                          </span>
                          {block.completed && (
                            <span className="text-emerald-600 font-medium">Completed</span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {block.title || 'Untitled Block'}
                        </h4>
                        {block.content && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                            {block.content.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-400 italic col-span-full">No blocks generated for this day.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBlock && (
        <BlockEditor
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onUpdated={handleBlockUpdated}
        />
      )}
    </div>
  );
}
