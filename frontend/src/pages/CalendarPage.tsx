import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { daysApi } from '@/api';
import { formatDate, todayString } from '@/utils';
import type { Day } from '@/types';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function CalendarPage() {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    daysApi
      .list()
      .then((res) => setDays(res))
      .catch(() => toast.error('Failed to load days calendar'))
      .finally(() => setLoading(false));
  }, []);

  const dayMap = new Map<string, Day>();
  days.forEach((d) => {
    const key = d.date.split('T')[0];
    dayMap.set(key, d);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calendar Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Select a date to view or configure its timeline</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const dateStr = day.date.split('T')[0];
            const journalBlocks = day.blocks ? day.blocks.filter((b) => b.type === 'JOURNAL') : [];
            const completedCount = journalBlocks.filter((b) => b.completed).length;

            return (
              <div
                key={day.id}
                onClick={() => navigate(`/?date=${dateStr}`)}
                className="card p-5 hover:shadow-card-hover transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {formatDate(dateStr, 'MMM d, yyyy')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {day.configuration ? `${day.configuration.startTime} - ${day.configuration.endTime}` : 'Unconfigured'}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {day.title || formatDate(dateStr, 'EEEE')}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{completedCount} / {journalBlocks.length} Completed</span>
                  </div>
                  {journalBlocks.length > 0 && (
                    <span className="font-semibold text-brand-600">
                      {Math.round((completedCount / journalBlocks.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
