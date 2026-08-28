import { useEffect, useRef, useState } from 'react';

export function useDay(date: string) {
  const [day, setDay] = useState<import('@/types').Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { daysApi } = await import('@/api');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    import('@/api').then(({ daysApi }) => {
      daysApi
        .get(date)
        .then((d) => { if (!cancelled) { setDay(d); setLoading(false); } })
        .catch((err) => {
          if (!cancelled) {
            if (err.response?.status === 404) {
              setDay(null);
              setLoading(false);
            } else {
              setError('Failed to load day');
              setLoading(false);
            }
          }
        });
    });

    return () => { cancelled = true; };
  }, [date]);

  return { day, setDay, loading, error };
}
