/**
 * @fileoverview React hook — useConversationState
 *
 * Creates a SessionRunState driven by useReducer, exposes an EventFeed
 * for upper layers to push events into. Upper layers (demo SSE reader,
 * daemon EventEmitter listener) are responsible for obtaining events
 * and calling feed.push().
 *
 * Backward-compatible alias `useSessionState` is exported from the
 * package barrel.
 */

import { useReducer, useCallback, useMemo } from 'react';

import { reducer } from '../core/conversation/reducer.js';
import { createEmptySessionState } from '../core/conversation/types.js';
import type { SessionRunState } from '../core/conversation/types.js';
import type { SSEEvent, EventFeed } from '../core/types.js';

/** Internal dispatch action */
type Action =
  | { type: 'event'; event: SSEEvent }
  | { type: 'reset' }
  | { type: 'loadHistory'; state: SessionRunState };

/** Wrapper reducer that routes dispatch actions */
function dispatchReducer(state: SessionRunState, action: Action): SessionRunState {
  switch (action.type) {
    case 'event':
      return reducer(state, action.event);
    case 'reset':
      return createEmptySessionState();
    case 'loadHistory':
      return action.state;
    default:
      /* v8 ignore next -- unreachable: Action is a closed union */
      return state;
  }
}

export interface UseConversationStateReturn {
  state: SessionRunState;
  feed: EventFeed;
  reset: () => void;
  /** Load a pre-built state (e.g. from fromHistory) into the reducer */
  loadHistory: (state: SessionRunState) => void;
}

/**
 * Hook: create a conversation state + feed.
 *
 * Upper layers push SSE events via `feed.push(event)`.
 * State updates trigger React re-renders.
 */
export function useConversationState(): UseConversationStateReturn {
  const [state, dispatch] = useReducer(dispatchReducer, undefined, createEmptySessionState);

  const feed = useMemo<EventFeed>(
    () => ({
      push: (event: SSEEvent) => dispatch({ type: 'event', event }),
    }),
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const loadHistory = useCallback((loadedState: SessionRunState) => {
    dispatch({ type: 'loadHistory', state: loadedState });
  }, []);

  return { state, feed, reset, loadHistory };
}
