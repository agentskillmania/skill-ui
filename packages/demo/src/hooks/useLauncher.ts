/**
 * Fetch launcher data (agents, skills, sessions)
 */
import { useState, useEffect, useCallback } from 'react';

import type { LauncherData } from '../types.js';

interface UseLauncherReturn {
  data: LauncherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLauncher(): UseLauncherReturn {
  const [data, setData] = useState<LauncherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLauncher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/launcher');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLauncher();
  }, [fetchLauncher]);

  return { data, loading, error, refresh: fetchLauncher };
}
