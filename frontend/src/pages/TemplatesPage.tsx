import React, { useState, useEffect } from 'react';
import { templatesApi } from '@/api';
import type { Template } from '@/types';
import { Layers, Plus, Trash2, Play, Clock, Loader2 } from 'lucide-react';
import { todayString } from '@/utils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    templatesApi
      .list()
      .then((res) => setTemplates(res))
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyTemplate = async (templateId: string) => {
    const today = todayString();
    try {
      await templatesApi.apply(templateId, { date: today, replaceExisting: true });
      toast.success('Template applied to today!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await templatesApi.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reusable Templates</h1>
          <p className="text-xs text-slate-500 mt-1">Save reusable schedule configurations for workdays, weekends, or study days</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card p-5 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{tpl.name}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {tpl.mode}
                </span>
              </div>

              {tpl.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{tpl.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  {tpl.startTime} – {tpl.endTime}
                </span>
                {tpl.defaultBlockDuration && (
                  <span>{tpl.defaultBlockDuration}m blocks</span>
                )}
                {tpl.breaks && tpl.breaks.length > 0 && (
                  <span>{tpl.breaks.length} break(s)</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDeleteTemplate(tpl.id)}
                  className="btn-ghost text-xs text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Apply to Today</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
