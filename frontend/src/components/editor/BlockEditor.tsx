import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useAutosave } from '@/hooks/useAutosave';
import { formatTime } from '@/utils';
import { X, Check, Loader2, Bold, Italic, List, ListOrdered, Tag, Smile, Trash2, Paperclip } from 'lucide-react';
import type { TimeBlock } from '@/types';
import { clsx } from 'clsx';

interface BlockEditorProps {
  block: TimeBlock;
  onClose: () => void;
  onUpdated: (updated: TimeBlock) => void;
  onDelete?: (id: string) => void;
}

const MOODS = [
  { value: 'great', label: 'Great', icon: '😄' },
  { value: 'good', label: 'Good', icon: '🙂' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'bad', label: 'Bad', icon: '🙁' },
  { value: 'terrible', label: 'Terrible', icon: '😫' },
];

export function BlockEditor({ block, onClose, onUpdated, onDelete }: BlockEditorProps) {
  const [title, setTitle] = useState(block.title || '');
  const [completed, setCompleted] = useState(block.completed);
  const [mood, setMood] = useState(block.mood || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(block.tags || []);
  const [type, setType] = useState(block.type);

  const { save, saveStatus } = useAutosave(block, onUpdated, 800);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'What happened during this block? Write your journal entry here...',
      }),
    ],
    content: block.content || '',
    onUpdate: ({ editor }) => {
      save({ content: editor.getHTML() });
    },
  });

  useEffect(() => {
    setTitle(block.title || '');
    setCompleted(block.completed);
    setMood(block.mood || '');
    setTags(block.tags || []);
    setType(block.type);
    if (editor && editor.getHTML() !== (block.content || '')) {
      editor.commands.setContent(block.content || '');
    }
  }, [block.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    save({ title: val });
  };

  const handleCompletedToggle = () => {
    const val = !completed;
    setCompleted(val);
    save({ completed: val });
  };

  const handleMoodSelect = (val: string) => {
    const nextMood = mood === val ? '' : val;
    setMood(nextMood);
    save({ mood: nextMood });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        const nextTags = [...tags, newTag];
        setTags(nextTags);
        save({ tags: nextTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    save({ tags: nextTags });
  };

  const handleTypeChange = (newType: any) => {
    setType(newType);
    save({ type: newType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1e2535] border border-slate-200 dark:border-[#2a3347] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#2a3347] bg-slate-50/50 dark:bg-[#161b27]/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              {formatTime(block.startTime)} – {formatTime(block.endTime)}
            </span>

            {/* Save indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-500 font-medium">Save failed (retrying)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(block.id);
                  onClose();
                }}
                className="btn-icon text-slate-400 hover:text-red-500"
                title="Delete Block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="btn-icon" aria-label="Close editor">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Block Type selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Block Type:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              {(['JOURNAL', 'BREAK', 'CUSTOM'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={clsx(
                    'px-3 py-1 rounded-md transition',
                    type === t
                      ? 'bg-white dark:bg-[#1e2535] text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder={type === 'BREAK' ? 'Break title (e.g. Lunch)' : 'Entry Title (optional)'}
              className="w-full text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-brand-500 focus:outline-none text-slate-900 dark:text-slate-100 py-1"
            />
          </div>

          {/* TipTap Toolbar */}
          {editor && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-[#2a3347]">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={clsx('p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700', editor.isActive('bold') && 'bg-slate-200 dark:bg-slate-700')}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={clsx('p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700', editor.isActive('italic') && 'bg-slate-200 dark:bg-slate-700')}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={clsx('p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700', editor.isActive('bulletList') && 'bg-slate-200 dark:bg-slate-700')}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={clsx('p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700', editor.isActive('orderedList') && 'bg-slate-200 dark:bg-slate-700')}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TipTap Editor Area */}
          <div className="min-h-[160px] p-3 rounded-lg border border-slate-200 dark:border-[#2a3347] bg-slate-50/30 dark:bg-[#161b27]/30">
            <EditorContent editor={editor} />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="label mb-2 block">Mood (Optional)</label>
            <div className="flex items-center gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMoodSelect(m.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    mood === m.value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label mb-2 block">Tags</label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter..."
              className="input text-xs"
            />
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editor-completed"
              checked={completed}
              onChange={handleCompletedToggle}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <label htmlFor="editor-completed" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark this time block as completed
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#2a3347] bg-slate-50/50 dark:bg-[#161b27]/50">
          <span className="text-xs text-slate-400">Autosaves automatically</span>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
