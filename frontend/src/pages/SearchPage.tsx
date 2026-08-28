import React, { useState } from 'react';
import { searchApi } from '@/api';
import type { SearchResult, TimeBlock } from '@/types';
import { Search as SearchIcon, Calendar, Clock, Tag, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils';
import { BlockEditor } from '@/components/editor/BlockEditor';
import toast from 'react-hot-toast';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await searchApi.search(query);
      setResults(res.results);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Search Entries</h1>
        <p className="text-xs text-slate-500 mt-1">Find entries by title, body text, or tags</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search journal entries (e.g. planning, coding, lunch)..."
            className="input pl-9 text-sm"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">Found {results.length} matching blocks</p>
          {results.map((res) => (
            <div
              key={res.blockId}
              onClick={() =>
                setSelectedBlock({
                  id: res.blockId,
                  dayId: res.dayId,
                  startTime: res.startTime,
                  endTime: res.endTime,
                  type: res.type,
                  title: res.title,
                  content: res.contentPreview,
                  tags: res.tags,
                  completed: res.completed,
                  orderIndex: 0,
                  createdAt: '',
                  updatedAt: '',
                })
              }
              className="card p-4 hover:shadow-card-hover cursor-pointer transition space-y-2 border-l-4 border-l-brand-500"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  {formatDate(res.date.split('T')[0], 'MMMM d, yyyy')}
                </span>
                <span className="font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {res.startTime} – {res.endTime}
                </span>
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {res.title || 'Untitled Block'}
              </h4>

              {res.contentPreview && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {res.contentPreview}
                </p>
              )}

              {res.tags && res.tags.length > 0 && (
                <div className="flex gap-1.5 pt-1">
                  {res.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="card p-8 text-center text-slate-400 text-xs">
          No entries matched "{query}"
        </div>
      ) : null}

      {selectedBlock && (
        <BlockEditor
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
