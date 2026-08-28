import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DayHeader } from '@/components/timeline/DayHeader';
import { ProgressIndicator } from '@/components/timeline/ProgressIndicator';
import { Timeline } from '@/components/timeline/Timeline';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { DayConfigurationModal } from '@/components/timeline/DayConfigurationModal';
import { daysApi, blocksApi } from '@/api';
import { todayString } from '@/utils';
import type { Day, TimeBlock } from '@/types';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFromUrl = searchParams.get('date');
  const [date, setDate] = useState<string>(dateFromUrl || todayString());
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  // Sync state if URL query param changes
  useEffect(() => {
    if (dateFromUrl && dateFromUrl !== date) {
      setDate(dateFromUrl);
    }
  }, [dateFromUrl]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setSearchParams({ date: newDate });
  };

  const fetchDay = async (targetDate: string) => {
    setLoading(true);
    try {
      const data = await daysApi.get(targetDate);
      setDay(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDay(null);
      } else {
        toast.error('Failed to load day timeline');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDay(date);
  }, [date]);

  const handleGenerateDay = async (config: any) => {
    try {
      const res = await daysApi.generate(date, config);
      setDay(res.day);
      toast.success('Timeline generated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate timeline');
    }
  };

  const handleToggleComplete = async (block: TimeBlock) => {
    try {
      const updated = await blocksApi.update(block.id, { completed: !block.completed });
      setDay((prev) =>
        prev
          ? {
              ...prev,
              blocks: prev.blocks.map((b) => (b.id === block.id ? updated : b)),
            }
          : null
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await blocksApi.delete(blockId);
      setDay((prev) =>
        prev
          ? {
              ...prev,
              blocks: prev.blocks.filter((b) => b.id !== blockId),
            }
          : null
      );
      toast.success('Block deleted');
    } catch {
      toast.error('Failed to delete block');
    }
  };

  const handleBlockUpdated = (updated: TimeBlock) => {
    setDay((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)),
          }
        : null
    );
  };

  const handleAddBlock = async () => {
    if (!day) return;
    try {
      const newBlock = await daysApi.createBlock(date, {
        startTime: '17:00',
        endTime: '17:30',
        type: 'JOURNAL',
        title: 'New Time Block',
        orderIndex: day.blocks.length,
      });
      setDay({ ...day, blocks: [...day.blocks, newBlock] });
      setSelectedBlock(newBlock);
    } catch {
      toast.error('Failed to create new block');
    }
  };

  return (
    <div className="space-y-6">
      <DayHeader
        date={date}
        onDateChange={handleDateChange}
        onOpenConfig={() => setConfigModalOpen(true)}
        onAddBlock={handleAddBlock}
        hasConfiguration={!!day?.configuration}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : day && day.configuration ? (
        <>
          <ProgressIndicator
            startTime={day.configuration.startTime}
            endTime={day.configuration.endTime}
            blocks={day.blocks}
          />

          <Timeline
            blocks={day.blocks}
            onSelectBlock={setSelectedBlock}
            onToggleComplete={handleToggleComplete}
            onDeleteBlock={handleDeleteBlock}
          />
        </>
      ) : (
        <div className="card p-12 text-center my-8 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            ✨
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            No schedule configured for {date}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set your start/end times and break preferences to automatically generate your day's time blocks.
          </p>
          <button
            onClick={() => setConfigModalOpen(true)}
            className="btn-primary py-2.5 px-6 mx-auto"
          >
            Configure Day
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {selectedBlock && (
        <BlockEditor
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onUpdated={handleBlockUpdated}
          onDelete={handleDeleteBlock}
        />
      )}

      {/* Day Configuration Modal */}
      <DayConfigurationModal
        date={date}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onGenerate={handleGenerateDay}
      />
    </div>
  );
}
