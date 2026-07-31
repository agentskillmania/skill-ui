/**
 * @fileoverview useResourceState — generic hook for typed resource lists
 *
 * Transport-agnostic state container for daemon-exposed resources (sessions,
 * agents, skills, crews). The consumer owns fetching and supplies a normalize
 * function (raw payload → typed object); this hook holds the normalized list
 * plus loading/error flags and exposes setData/upsertItem/removeItem mutations.
 * When no key extractor is provided, upsertItem/removeItem are no-ops.
 */
import { useState, useCallback } from 'react';

import type { RawResource } from '../core/resources/types.js';

export interface UseResourceStateReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  setData: (rawItems: RawResource[]) => void;
  upsertItem: (rawItem: RawResource) => void;
  removeItem: (key: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export function useResourceState<T>(
  normalize: (raw: RawResource) => T,
  getKey?: (item: T) => string
): UseResourceStateReturn<T> {
  const [data, setDataState] = useState<T[]>([]);
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const setData = useCallback(
    (rawItems: RawResource[]) => {
      setDataState(rawItems.map(normalize));
    },
    [normalize]
  );

  const upsertItem = useCallback(
    (rawItem: RawResource) => {
      if (!getKey) return;
      const normalized = normalize(rawItem);
      const key = getKey(normalized);
      setDataState((prev) => {
        const idx = prev.findIndex((item) => getKey!(item) === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = normalized;
          return next;
        }
        return [...prev, normalized];
      });
    },
    [normalize, getKey]
  );

  const removeItem = useCallback(
    (key: string) => {
      if (!getKey) return;
      setDataState((prev) => prev.filter((item) => getKey!(item) !== key));
    },
    [getKey]
  );

  const setLoading = useCallback((value: boolean) => setLoadingState(value), []);
  const setError = useCallback((value: string | null) => setErrorState(value), []);
  const clear = useCallback(() => {
    setDataState([]);
    setLoadingState(false);
    setErrorState(null);
  }, []);

  return { data, loading, error, setData, upsertItem, removeItem, setLoading, setError, clear };
}
