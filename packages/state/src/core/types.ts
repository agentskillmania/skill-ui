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
 * One element of a colts multimodal `content[]` (OpenAI content-parts shape).
 * `image_url.url` may be a data URL, http(s) URL, or a `file:` reference
 * (relative to the session dir — the host resolves it before rendering).
 */
export type ColtsContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: string | null } };

/**
 * Minimal representation of a colts Message, used for history loading.
 * The state package does not depend on colts — this is a structural type
 * that accepts colts Message[] without importing it.
 *
 * `content` is a bare string for plain-text messages (the untagged wire
 * shape) or a content-parts array for multimodal messages.
 */
export interface ColtsMessageInput {
  role: string;
  content: string | ColtsContentPart[];
  type?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    /** 可选工具来源('mcp'|'builtin'|'script')——宿主或 daemon 补充,
     * 透传到 tool_call 块的 metadata 供徽章渲染。 */
    toolType?: string;
  }>;
  toolCallId?: string;
  toolName?: string;
  isError?: boolean;
  timestamp?: number;
  /** 该轮的用量汇总(wrangler.rs 在 run 收尾写到轮末 assistant 行;
   * camelCase,与 TurnUsage 同形)。旧存档无此键,自然降级。 */
  usage?: import('./conversation/types.js').TurnUsage;
}
