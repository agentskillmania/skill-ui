/**
 * @fileoverview React hook — useDiagnosticsState
 *
 * Creates a DiagnosticsState driven by useReducer, exposes an EventFeed
 * for upper layers to push events into. The diagnostics slice uses
 * snapshot semantics: each 'agent-diagnostics' event replaces the whole
 * state (see core/diagnostics/reducer.ts).
 *
 * Upper layers (demo SSE reader, daemon EventEmitter listener) are
 * responsible for obtaining events and calling feed.push().
 */

import { useReducer, useCallback, useMemo } from 'react';

import { diagnosticsReducer } from '../core/diagnostics/reducer.js';
import { createEmptyDiagnosticsState } from '../core/diagnostics/types.js';
import type { DiagnosticsState } from '../core/diagnostics/types.js';
import type { SSEEvent, EventFeed } from '../core/types.js';

/** Internal dispatch action */
type Action = { type: 'event'; event: SSEEvent } | { type: 'reset' };

/** Wrapper reducer that routes dispatch actions */
function dispatchReducer(state: DiagnosticsState, action: Action): DiagnosticsState {
  switch (action.type) {
    case 'event':
      return diagnosticsReducer(state, action.event);
    case 'reset':
      return createEmptyDiagnosticsState();
    default:
      /* v8 ignore next -- unreachable: Action is a closed union */
      return state;
  }
}

export interface UseDiagnosticsStateReturn {
  state: DiagnosticsState;
  feed: EventFeed;
  reset: () => void;
}

/**
 * Hook: create a diagnostics state + feed.
 *
 * Upper layers push SSE events via `feed.push(event)`.
 * State updates trigger React re-renders.
 */
export function useDiagnosticsState(): UseDiagnosticsStateReturn {
  const [state, dispatch] = useReducer(dispatchReducer, undefined, createEmptyDiagnosticsState);

  const feed = useMemo<EventFeed>(
    () => ({
      push: (event: SSEEvent) => dispatch({ type: 'event', event }),
    }),
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  return { state, feed, reset };
}
