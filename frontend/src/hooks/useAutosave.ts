import { useCallback, useEffect, useRef, useState } from 'react';
import { blocksApi } from '@/api';
import type { TimeBlock } from '@/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(
  block: TimeBlock,
  onSaved?: (updated: TimeBlock) => void,
  debounceMs = 1000
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingRef = useRef<Partial<TimeBlock>>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const save = useCallback(
    async (patch: Partial<TimeBlock>) => {
      // Merge into pending
      pendingRef.current = { ...pendingRef.current, ...patch };

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        const toSave = { ...pendingRef.current };
        pendingRef.current = {};

        setSaveStatus('saving');
        try {
          const updated = await blocksApi.update(block.id, toSave);
          if (isMountedRef.current) {
            setSaveStatus('saved');
            onSaved?.(updated);
            setTimeout(() => {
              if (isMountedRef.current) setSaveStatus('idle');
            }, 2000);
          }
        } catch {
          if (isMountedRef.current) {
            setSaveStatus('error');
            // Restore pending so we can retry
            pendingRef.current = { ...toSave, ...pendingRef.current };
          }
        }
      }, debounceMs);
    },
    [block.id, debounceMs, onSaved]
  );

  return { save, saveStatus };
}
