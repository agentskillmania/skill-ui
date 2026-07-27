/**
 * useChatSession — SSE connection hook backed by skill-ui-state
 *
 * Consumes the daemon/demo SSE stream, pushes every event into the state
 * package's reducer via EventFeed, and exposes mapped state for the
 * chat and cockpit UI components.
 */
import type { Message, Block, ChatCommand } from '@agentskillmania/skill-ui-chat';
import type { CockpitEvent } from '@agentskillmania/skill-ui-cockpit';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useSessionState,
  selectMainMessages,
  selectEvents,
  selectStatus,
  selectTotalTokens,
  selectStepCount,
  fromHistory,
} from '@agentskillmania/skill-ui-state';
import type { AgentMessage, AgentEvent, ColtsMessageInput } from '@agentskillmania/skill-ui-state';

type ChatStatus = 'idle' | 'streaming' | 'error';

// ─── Mapping: state types → UI package types ──────────────────────

/** Map state package AgentMessage → chat package Message (shapes are compatible) */
function mapMessages(agentMessages: AgentMessage[]): Message[] {
  return agentMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    blocks: m.blocks as Block[] | undefined,
    status: m.status,
    createdAt: m.createdAt,
  }));
}

/** Map state package AgentEvent → cockpit package CockpitEvent */
function mapEvents(agentEvents: AgentEvent[]): CockpitEvent[] {
  return agentEvents.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    // AgentEvent.type is a loose string; the demo's SSE stream only emits
    // names in the CockpitEventType union, so the cast is safe here.
    type: e.type as CockpitEvent['type'],
    label: e.label,
    payload: e.payload,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useChatSession(sessionId: string) {
  const { state, feed, reset, loadHistory } = useSessionState();
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [commands, setCommands] = useState<ChatCommand[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch command list + session history on mount (and when sessionId changes)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/chat/commands')
      .then((res) => res.json())
      .then((data: ChatCommand[]) => {
        if (!cancelled) setCommands(data);
      })
      .catch(() => {});

    // Rebuild state from server-side conversation history so resumed
    // sessions show their prior messages instead of a blank slate.
    fetch(`/api/chat/${sessionId}/messages`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: ColtsMessageInput[] } | null) => {
        if (cancelled || !data?.messages?.length) return;
        loadHistory(fromHistory(data.messages));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sessionId, loadHistory]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message to state
      feed.push({
        event: 'user-message',
        data: { content },
      });

      setStatus('streaming');
      setInputValue('');

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const response = await fetch(`/api/chat/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE format
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

            // Push every SSE event into the state reducer
            feed.push({ event: eventType, data });
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User stopped — mark streaming blocks as completed
          feed.push({ event: 'done', data: { aborted: true } });
        } else {
          setStatus('error');
        }
      } finally {
        setStatus('idle');
        abortRef.current = null;
      }
    },
    [sessionId, feed]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    fetch(`/api/chat/${sessionId}/stop`, { method: 'POST' }).catch(() => {});
  }, [sessionId]);

  const respondHumanInput = useCallback(
    (requestId: string, response: unknown) => {
      fetch(`/api/chat/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, response }),
      }).catch(() => {});
    },
    [sessionId]
  );

  // Map state for consumers
  const messages = mapMessages(selectMainMessages(state));
  const cockpitEvents = mapEvents(selectEvents(state));
  const totalTokens = selectTotalTokens(state);
  const stepCount = selectStepCount(state);

  return {
    // Chat
    messages,
    status: status as ChatStatus,
    inputValue,
    onInputChange: setInputValue,
    sendMessage,
    stop,
    commands,
    respondHumanInput,
    // Cockpit
    cockpitEvents,
    totalTokens,
    stepCount,
  };
}
