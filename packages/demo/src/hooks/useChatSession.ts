/**
 * useChatSession — SSE connection hook backed by skill-ui-state
 *
 * Two-phase session model matching wrangler-daemon's API:
 * 1. First message: POST /api/agents/:name/chat → creates session,
 *    first SSE event is `session-start { sessionId }`.
 * 2. Subsequent messages: POST /api/chat/:sessionId (resume).
 *
 * For sessions resumed from history (sessionId already known), phase 2
 * is used directly.
 */
import type { Message, ChatCommand } from '@agentskillmania/skill-ui-chat';
import type { CockpitEvent } from '@agentskillmania/skill-ui-cockpit';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  useSessionState,
  selectMainMessages,
  selectEvents,
  selectTotalTokens,
  selectStepCount,
  fromHistory,
} from '@agentskillmania/skill-ui-state';
import type { AgentEvent, ColtsMessageInput, SSEEvent } from '@agentskillmania/skill-ui-state';

type ChatStatus = 'idle' | 'streaming' | 'error';

// ─── Mapping ─────────────────────────────────────────────────────

function mapEvents(agentEvents: AgentEvent[]): CockpitEvent[] {
  return agentEvents.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type as CockpitEvent['type'],
    label: e.label,
    payload: e.payload,
  }));
}

export interface UseChatSessionOptions {
  /** Agent name for daemon's /api/agents/:name/chat (first message). */
  agentName?: string;
  /** Workspace path passed to daemon on session creation. */
  workspacePath?: string;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useChatSession(
  sessionId: string,
  options?: UseChatSessionOptions
) {
  const { state, feed, loadHistory } = useSessionState();
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [commands, setCommands] = useState<ChatCommand[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId.startsWith('__') || sessionId.startsWith('pending-') ? null : sessionId
  );
  const abortRef = useRef<AbortController | null>(null);

  // rAF batching
  const pendingEventsRef = useRef<SSEEvent[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const flushEvents = useCallback(() => {
    rafIdRef.current = null;
    const batch = pendingEventsRef.current;
    if (batch.length === 0) return;
    pendingEventsRef.current = [];
    for (const evt of batch) {
      feed.push(evt);
    }
  }, [feed]);

  const batchedPush = useCallback(
    (evt: SSEEvent) => {
      if (evt.event !== 'token' && evt.event !== 'thinking') {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          flushEvents();
        }
        feed.push(evt);
        return;
      }
      pendingEventsRef.current.push(evt);
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flushEvents);
      }
    },
    [feed, flushEvents]
  );

  // Sync external sessionId changes (e.g. copilot session created)
  useEffect(() => {
    const isReal = !sessionId.startsWith('__') && !sessionId.startsWith('pending-');
    if (isReal && sessionId !== activeSessionId) {
      setActiveSessionId(sessionId);
    }
  }, [sessionId, activeSessionId]);

  // Fetch commands + history when we have a real session
  useEffect(() => {
    fetch('/api/chat/commands')
      .then((res) => res.json())
      .then((data: ChatCommand[]) => setCommands(data))
      .catch(() => {});

    if (!activeSessionId) return;
    let cancelled = false;
    fetch(`/api/chat/${activeSessionId}/messages`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: ColtsMessageInput[] } | null) => {
        if (cancelled || !data?.messages?.length) return;
        loadHistory(fromHistory(data.messages));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeSessionId, loadHistory]);

  // ─── SSE stream reader (shared by both phases) ──

  const readSSEStream = useCallback(
    async (response: Response, onSessionStart?: (id: string) => void) => {
      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6);
            }
          }

          if (!eventType) continue;

          let data: Record<string, unknown> = {};
          try {
            data = JSON.parse(dataStr);
          } catch {
            continue;
          }

          // Capture sessionId from session-start event (phase 1 only)
          if (eventType === 'session-start' && onSessionStart) {
            const sid = (data as { sessionId?: string }).sessionId;
            if (sid) onSessionStart(sid);
            continue; // don't push to reducer
          }

          batchedPush({ event: eventType, data });
        }
      }
    },
    [batchedPush]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message to state
      batchedPush({ event: 'user-message', data: { content } });

      setStatus('streaming');
      setInputValue('');

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        let response: Response;

        if (activeSessionId) {
          // Phase 2: resume existing session
          response = await fetch(`/api/chat/${activeSessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content }),
            signal: abortController.signal,
          });
          await readSSEStream(response);
        } else {
          // Phase 1: create new session via agent chat
          const agentName = options?.agentName ?? 'coder';
          const workspacePath = options?.workspacePath ?? '.';
          response = await fetch(`/api/agents/${agentName}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, workspacePath }),
            signal: abortController.signal,
          });
          await readSSEStream(response, (sid) => {
            setActiveSessionId(sid);
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          batchedPush({ event: 'done', data: { aborted: true } });
        } else {
          setStatus('error');
        }
      } finally {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          flushEvents();
        }
        setStatus('idle');
        abortRef.current = null;
      }
    },
    [activeSessionId, options, batchedPush, flushEvents, readSSEStream]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (activeSessionId) {
      fetch(`/api/chat/${activeSessionId}/stop`, { method: 'POST' }).catch(() => {});
    }
  }, [activeSessionId]);

  const respondHumanInput = useCallback(
    (requestId: string, response: unknown) => {
      if (!activeSessionId) return;
      fetch(`/api/chat/${activeSessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, response }),
      }).catch(() => {});
    },
    [activeSessionId]
  );

  // ─── Selectors ──

  const messages = selectMainMessages(state) as unknown as Message[];
  const cockpitEvents = useMemo(() => mapEvents(selectEvents(state)), [state.events]);
  const totalTokens = selectTotalTokens(state);
  const stepCount = selectStepCount(state);

  return {
    messages,
    status: status as ChatStatus,
    inputValue,
    onInputChange: setInputValue,
    sendMessage,
    stop,
    commands,
    respondHumanInput,
    cockpitEvents,
    totalTokens,
    stepCount,
    /** The real session ID once established (null before first message). */
    resolvedSessionId: activeSessionId,
  };
}
