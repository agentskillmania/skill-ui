/**
 * @fileoverview normalize.ts — wire event → canonical internal event
 *
 * The single adaptation boundary between the daemons' SSE wire shapes and the
 * reducer. `reducer()` calls this as step 0, so every entry point (feed.push,
 * tests, direct reducer use) gets the canonical shape for free.
 *
 * Ground truth on who emits what (recon 2026-08, wrangler.rs sse.rs +
 * wrangler TS agent-session.ts mapEvent):
 *
 * | variant                    | TS daemon (colts)     | Rust daemon (wrangler.rs)        |
 * |----------------------------|-----------------------|----------------------------------|
 * | TokenStats casing          | camelCase everywhere  | snake_case — EXCEPT subagent-end,|
 * |                            |                       | which Rust hand-builds as camel  |
 * | subagent-tool-end `result` | may be an object      | always a string                  |
 * | subagent-tool-start        | action:{id,tool,arguments} wrapper (colts Action) — both |
 * | subagent-token/thinking    | {subtaskId, name, delta|content} — both                  |
 *
 * Everything else is wire-identical across the daemons. Leniency beyond this
 * table is dead defense and does not belong here; input *validation* (garbage
 * filtering, e.g. todo items) stays in the handlers — this module only folds
 * real wire VARIANTS into one shape.
 */

import type { SSEEvent } from '../types.js';
import type { TokenStats } from './types.js';

/** Canonical internal event: the SSE envelope plus an optional sub-agent target. */
export interface NormalizedEvent {
  event: string;
  data: Record<string, unknown>;
  /** Present iff the event targets a sub-agent run. '' means "a sub-agent
   * event with a missing/unknown id" — it still routes to the sub path and
   * is dropped on the lookup miss (never leaks into the main run). */
  subtaskId?: string;
}

type WireTokens = Partial<TokenStats> & { cache_read?: number; cache_write?: number };

/** Fold TokenStats casing variants into canonical camelCase. Absent stays absent
 * (callers distinguish "no tokens field" from "zero reading"). */
function normalizeTokens(raw: unknown): TokenStats | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const t = raw as WireTokens;
  return {
    input: t.input ?? 0,
    output: t.output ?? 0,
    cacheRead: t.cacheRead ?? t.cache_read ?? 0,
    cacheWrite: t.cacheWrite ?? t.cache_write ?? 0,
  };
}

export function normalizeEvent(sse: SSEEvent): NormalizedEvent {
  const { event, data } = sse;
  const tokens = normalizeTokens(data.tokens);
  const withTokens = tokens ? { ...data, tokens } : data;

  if (!event.startsWith('subagent-')) {
    return { event, data: withTokens };
  }

  const subtaskId = typeof data.subtaskId === 'string' ? data.subtaskId : undefined;
  switch (event) {
    // Content events unwrap to the MAIN event shape — the sub-run is then
    // driven by the same handlers as the main run (single block semantics).
    case 'subagent-token':
      return { event: 'token', data: { delta: data.delta ?? '' }, subtaskId: subtaskId ?? '' };
    case 'subagent-thinking':
      return {
        event: 'thinking',
        data: { content: data.content ?? '' },
        subtaskId: subtaskId ?? '',
      };
    case 'subagent-tool-start': {
      const action =
        (data.action as {
          id?: string;
          tool?: string;
          arguments?: unknown;
          toolType?: string;
        }) ?? {};
      return {
        event: 'tool-start',
        data: {
          id: action.id,
          name: action.tool,
          args: action.arguments,
          // toolType is a host-decoration channel (never emitted by daemons) —
          // the sub path keeps the same passthrough contract as the main one.
          ...(typeof action.toolType === 'string' ? { toolType: action.toolType } : {}),
        },
        subtaskId: subtaskId ?? '',
      };
    }
    case 'subagent-tool-end': {
      const result =
        typeof data.result === 'string' ? data.result : JSON.stringify(data.result ?? '');
      return {
        event: 'tool-end',
        data: { callId: data.callId, result },
        subtaskId: subtaskId ?? '',
      };
    }
    default:
      // subagent-start / subagent-end keep their own names — they carry
      // lifecycle semantics (run creation, summary) with no main-side analog.
      return { event, data: withTokens, subtaskId };
  }
}
