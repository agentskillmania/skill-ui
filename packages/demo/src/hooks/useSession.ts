/**
 * Session lifecycle management — create, resume, delete
 *
 * With the daemon backend, sessions are NOT created explicitly.
 * They are created implicitly on the first POST /api/agents/:name/chat.
 * This hook tracks the workspace path + agent name until the real
 * session ID arrives from the chat SSE stream.
 */
import { useState, useCallback } from 'react';

import type { SessionInfo } from '../types.js';

interface PendingSession {
  workspacePath: string;
  agentName: string;
}

interface UseSessionReturn {
  /** Active session info (loaded from daemon for resumed sessions). */
  activeSession: SessionInfo | null;
  /** Pending session config before the first message establishes a real ID. */
  pendingSession: PendingSession | null;
  creating: boolean;
  error: string | null;
  /**
   * Prepare a new session — records workspace + agent, returns a
   * synthetic SessionInfo with a placeholder ID. The real session
   * is created when the first message is sent via useChatSession.
   */
  createSession: (options: {
    workspacePath: string;
    agentPath?: string;
  }) => Promise<SessionInfo | null>;
  /** Load an existing session from daemon by ID. */
  loadSession: (id: string) => Promise<SessionInfo | null>;
  deleteSession: (id: string) => Promise<boolean>;
  clearSession: () => void;
}

export function useSession(): UseSessionReturn {
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (options: { workspacePath: string; agentPath?: string }): Promise<SessionInfo | null> => {
      setCreating(true);
      setError(null);
      try {
        const agentName = options.agentPath ?? 'coder';
        const workspacePath = options.workspacePath;

        // Record pending config — the real session ID arrives from
        // the SSE stream on first message.
        setPendingSession({ workspacePath, agentName });

        // Return a synthetic SessionInfo with a placeholder ID.
        // The caller navigates to workspace immediately; the real
        // session ID is resolved by useChatSession when the user
        // sends their first message.
        const now = new Date().toISOString();
        const placeholderId = `pending-${Date.now()}`;
        const info: SessionInfo = {
          id: placeholderId,
          workspacePath,
          agentName,
          model: '',
          status: 'idle',
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
        };
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
      setPendingSession(null);
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
          setPendingSession(null);
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
    setPendingSession(null);
  }, []);

  return {
    activeSession,
    pendingSession,
    creating,
    error,
    createSession,
    loadSession,
    deleteSession,
    clearSession,
  };
}
