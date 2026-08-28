import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import type { BreakConfig, ConfigMode } from '@/types';
import { clsx } from 'clsx';

interface DayConfigurationModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: {
    startTime: string;
    endTime: string;
    mode: ConfigMode;
    blockDuration?: number;
    numberOfSections?: number;
    breaks: BreakConfig[];
  }) => void;
}

export function DayConfigurationModal({
  date,
  isOpen,
  onClose,
  onGenerate,
}: DayConfigurationModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');
  const [mode, setMode] = useState<ConfigMode>('DURATION');
  const [blockDuration, setBlockDuration] = useState<number>(30);
  const [numberOfSections, setNumberOfSections] = useState<number>(12);
  const [breaks, setBreaks] = useState<BreakConfig[]>([
    { startTime: '12:30', endTime: '13:15', title: 'Lunch Break' },
  ]);

  if (!isOpen) return null;

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      { startTime: '12:00', endTime: '12:30', title: 'Break' },
    ]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleBreakChange = (index: number, field: keyof BreakConfig, value: string) => {
    const nextBreaks = [...breaks];
    nextBreaks[index] = { ...nextBreaks[index], [field]: value };
    setBreaks(nextBreaks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      startTime,
      endTime,
      mode,
      blockDuration: mode === 'DURATION' ? blockDuration : undefined,
      numberOfSections: mode === 'SECTIONS' ? numberOfSections : undefined,
      breaks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-[#2a3347] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#2a3347] bg-slate-50/50 dark:bg-[#161b27]/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span>Create your day</span>
            </h2>
            <p className="text-xs text-slate-500">Date: {date}</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Schedule range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label mb-1 block">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {/* Division mode selection */}
          <div>
            <label className="label mb-2 block">Divide Into</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('DURATION')}
                className={clsx(
                  'p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition',
                  mode === 'DURATION'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Clock className="w-4 h-4" />
                <span>Fixed Duration</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('SECTIONS')}
                className={clsx(
                  'p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition',
                  mode === 'SECTIONS'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>No. of Sections</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('CUSTOM')}
                className={clsx(
                  'p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition',
                  mode === 'CUSTOM'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>Fully Custom</span>
              </button>
            </div>
          </div>

          {/* Mode-specific configuration inputs */}
          {mode === 'DURATION' && (
            <div>
              <label className="label mb-1 block">Block Duration</label>
              <select
                value={blockDuration}
                onChange={(e) => setBlockDuration(Number(e.target.value))}
                className="input"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (Pomodoro)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
                <option value={90}>90 minutes (1.5 hours)</option>
                <option value={120}>120 minutes (2 hours)</option>
              </select>
            </div>
          )}

          {mode === 'SECTIONS' && (
            <div>
              <label className="label mb-1 block">Number of Sections</label>
              <input
                type="number"
                min={1}
                max={48}
                value={numberOfSections}
                onChange={(e) => setNumberOfSections(Number(e.target.value))}
                className="input"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Will automatically divide non-break time into ~{numberOfSections} equal blocks.
              </p>
            </div>
          )}

          {mode === 'CUSTOM' && (
            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              Custom mode creates single empty timeline containers for non-break intervals, allowing you to add/adjust custom blocks manually.
            </p>
          )}

          {/* Breaks section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Breaks</label>
              <button
                type="button"
                onClick={handleAddBreak}
                className="btn-ghost text-xs text-brand-600 dark:text-brand-400 p-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add break</span>
              </button>
            </div>

            <div className="space-y-3">
              {breaks.map((brk, index) => (
                <div key={index} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={brk.title || ''}
                      onChange={(e) => handleBreakChange(index, 'title', e.target.value)}
                      placeholder="Break Title (e.g., Lunch)"
                      className="input text-xs font-semibold bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBreak(index)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Start</span>
                      <input
                        type="time"
                        value={brk.startTime}
                        onChange={(e) => handleBreakChange(index, 'startTime', e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">End</span>
                      <input
                        type="time"
                        value={brk.endTime}
                        onChange={(e) => handleBreakChange(index, 'endTime', e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {breaks.length === 0 && (
                <p className="text-xs text-slate-400 italic">No breaks added yet.</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button type="submit" className="btn-primary w-full py-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Generate Day</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
