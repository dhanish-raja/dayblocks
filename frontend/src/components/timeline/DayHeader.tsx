import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings, Plus, Calendar } from 'lucide-react';
import { formatDate, relativeDate } from '@/utils';
import { addDays, subDays, parseISO, format } from 'date-fns';

interface DayHeaderProps {
  date: string;
  onDateChange: (newDate: string) => void;
  onOpenConfig: () => void;
  onAddBlock?: () => void;
  hasConfiguration?: boolean;
}

export function DayHeader({
  date,
  onDateChange,
  onOpenConfig,
  onAddBlock,
  hasConfiguration = false,
}: DayHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const currentDate = parseISO(date);

  // Close date picker popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrev = () => {
    const prev = subDays(currentDate, 1);
    onDateChange(format(prev, 'yyyy-MM-dd'));
  };

  const handleNext = () => {
    const next = addDays(currentDate, 1);
    onDateChange(format(next, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange(e.target.value);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2a3347] relative">
      <div className="relative" ref={datePickerRef}>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="group flex flex-col text-left focus:outline-none rounded-lg p-1.5 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
          title="Click to select a date"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {relativeDate(date)}
            </span>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline">
              Change Date ▾
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>{formatDate(date, 'EEEE, MMMM d')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDate(date, 'yyyy')} timeline log
          </p>
        </button>

        {/* Date Picker Dropdown Popover */}
        {showDatePicker && (
          <div className="absolute left-0 top-full mt-2 z-40 bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-[#2a3347] rounded-xl shadow-2xl p-4 w-72 animate-slide-up space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jump to Date
              </span>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <input
              type="date"
              value={date}
              onChange={handleCustomDateSelect}
              className="input text-sm w-full cursor-pointer"
            />

            <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleToday();
                  setShowDatePicker(false);
                }}
                className="btn-secondary text-xs flex-1 py-1.5"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateChange(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
                  setShowDatePicker(false);
                }}
                className="btn-ghost text-xs flex-1 py-1.5"
              >
                Yesterday
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {/* Navigation buttons */}
        <div className="flex items-center bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-[#2a3347] rounded-lg p-1 shadow-sm">
          <button
            onClick={handlePrev}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-md transition"
            title="Jump to Today's date"
          >
            Jump to Today
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Configure button */}
        <button
          onClick={onOpenConfig}
          className="btn-secondary"
        >
          <Settings className="w-4 h-4" />
          <span>{hasConfiguration ? 'Configure Day' : 'Setup Timeline'}</span>
        </button>

        {/* Add custom block */}
        {hasConfiguration && onAddBlock && (
          <button
            onClick={onAddBlock}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        )}
      </div>
    </div>
  );
}
