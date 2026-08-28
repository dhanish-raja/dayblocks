import { useEffect, useState } from 'react';
import { daysApi } from '@/api';
import type { Day } from '@/types';

export function useDay(date: string) {
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    daysApi
      .get(date)
      .then((d) => {
        if (!cancelled) {
          setDay(d);
          setLoading(false);
        }
      })
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

    return () => {
      cancelled = true;
    };
  }, [date]);

  return { day, setDay, loading, error };
}
