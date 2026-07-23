/**
 * Session lifecycle management — create, resume, delete
 */
import { useState, useCallback } from 'react';

import type { SessionInfo } from '../../server/types.js';

interface UseSessionReturn {
  activeSession: SessionInfo | null;
  creating: boolean;
  error: string | null;
  createSession: (options: {
    workspacePath: string;
    agentPath?: string;
  }) => Promise<SessionInfo | null>;
  loadSession: (id: string) => Promise<SessionInfo | null>;
  deleteSession: (id: string) => Promise<boolean>;
  clearSession: () => void;
}

export function useSession(): UseSessionReturn {
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (options: { workspacePath: string; agentPath?: string }): Promise<SessionInfo | null> => {
      setCreating(true);
      setError(null);
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const info = (await res.json()) as SessionInfo;
        setActiveSession(info);
        return info;
      } catch (err) {
        setError(String(err));
        return null;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  const loadSession = useCallback(async (id: string): Promise<SessionInfo | null> => {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const info = (await res.json()) as SessionInfo;
      setActiveSession(info);
      return info;
    } catch (err) {
      setError(String(err));
      return null;
    }
  }, []);

  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (activeSession?.id === id) {
          setActiveSession(null);
        }
        return true;
      } catch {
        return false;
      }
    },
    [activeSession]
  );

  const clearSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  return {
    activeSession,
    creating,
    error,
    createSession,
    loadSession,
    deleteSession,
    clearSession,
  };
}
