/**
 * useCockpitEvents — SSE hook for cockpit events and agent state
 */
import type {
  CockpitEvent,
  CockpitEventType,
  AgentStateData,
} from '@agentskillmania/skill-ui-cockpit';
import { useState, useEffect, useRef, useCallback } from 'react';

interface CockpitEventsState {
  events: CockpitEvent[];
  agentState: AgentStateData | null;
}

let eventIdCounter = 0;

export function useCockpitEvents(sessionId: string) {
  const [state, setState] = useState<CockpitEventsState>({
    events: [],
    agentState: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const connect = useCallback(() => {
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const eventSource = new EventSource(`/api/agent/${sessionId}/state`);

    eventSource.addEventListener('agent-state', (e) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => ({
          ...prev,
          agentState: {
            ...data,
            status: data.status ?? 'idle',
            skills: data.skills ?? [],
            tools: data.tools ?? [],
            compressionHistory: data.compressionHistory ?? [],
          } as AgentStateData,
        }));
      } catch {
        // Ignore parse errors
      }
    });

    eventSource.addEventListener('cockpit-event', (e) => {
      try {
        const data = JSON.parse(e.data);
        const cockpitEvent: CockpitEvent = {
          id: `evt-${Date.now()}-${++eventIdCounter}`,
          timestamp: data.timestamp ?? Date.now(),
          type: data.type as CockpitEventType,
          subtype: data.subtype ?? '',
          label: data.label ?? '',
          payload: data.payload,
        };
        setState((prev) => ({
          ...prev,
          events: [...prev.events, cockpitEvent],
        }));
      } catch {
        // Ignore parse errors
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const clearEvents = useCallback(() => {
    setState((prev) => ({ ...prev, events: [] }));
  }, []);

  return {
    events: state.events,
    agentState: state.agentState,
    clearEvents,
  };
}
