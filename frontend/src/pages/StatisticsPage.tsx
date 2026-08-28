import React, { useState, useEffect } from 'react';
import { statisticsApi } from '@/api';
import type { Statistics } from '@/types';
import { BarChart3, CheckCircle2, Flame, Coffee, Calendar, Clock, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statisticsApi
      .get()
      .then((res) => setStats(res))
      .catch(() => toast.error('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.activityByHour.map((item) => ({
    hour: `${item.hour}:00`,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Journaling Insights</h1>
        <p className="text-xs text-slate-500 mt-1">Overview of your time logging activity and metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Days</span>
            <Calendar className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalDays}</p>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.completedBlocks} <span className="text-xs font-normal text-slate-400">({stats.completionRate}%)</span>
          </p>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Day Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.streak} Days</p>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Breaks Taken</span>
            <Coffee className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalBreaks}</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Most Active Time of Day</span>
          </h3>
          {stats.mostActiveHour !== null && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Peak: {stats.mostActiveHour}:00
            </span>
          )}
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e2535',
                  borderColor: '#2a3347',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
