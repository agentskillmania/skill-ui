/**
 * @fileoverview Shared types — used across multiple state slices
 *
 * These are the provider-neutral input interfaces to the state machine.
 * The state package is a pure, passive state machine: it consumes SSE
 * events via an EventFeed and history via ColtsMessageInput, producing
 * structured state that chat and cockpit UIs read from via selectors.
 *
 * No dependencies on daemon, colts, chat, or cockpit packages.
 */

// ─── Input: SSE Event ─────────────────────────────────────────────

/**
 * Provider-neutral SSE event envelope.
 *
 * The `event` field uses hyphenated names matching the daemon's SSE stream
 * (e.g. 'tool-start', 'subagent-token', 'done'). The `data` field carries
 * the event payload as a loose record.
 */
export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

// ─── Event Feed Interface ─────────────────────────────────────────

/**
 * The sole input interface for the state machine.
 * Upper layers (demo SSE reader, daemon EventEmitter listener, tests)
 * implement this to push events into the reducer.
 */
export interface EventFeed {
  push(event: SSEEvent): void;
}

// ─── History Loading Input ────────────────────────────────────────

/**
 * Minimal representation of a colts Message, used for history loading.
 * The state package does not depend on colts — this is a structural type
 * that accepts colts Message[] without importing it.
 */
export interface ColtsMessageInput {
  role: string;
  content: string;
  type?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  toolCallId?: string;
  toolName?: string;
  isError?: boolean;
  timestamp?: number;
}
