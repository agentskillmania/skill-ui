/**
 * @fileoverview Selectors — query SessionRunState for specific consumers
 *
 * Pure functions that project the unified state into shapes
 * chat and cockpit UIs need. Consumers write their own mapping
 * layer on top of these (e.g. AgentMessage → chat package's Message).
 */

import type { SessionRunState, SubAgentRunState, AgentMessage, AgentEvent } from './types.js';

/** Get the main agent's structured messages (for chat UI) */
export function selectMainMessages(state: SessionRunState): AgentMessage[] {
  return state.main.messages;
}

/** Get a sub-agent by subtaskId */
export function selectSubAgent(
  state: SessionRunState,
  subtaskId: string
): SubAgentRunState | undefined {
  return state.subAgents.get(subtaskId);
}

/** Get a sub-agent's conversation messages */
export function selectSubAgentMessages(state: SessionRunState, subtaskId: string): AgentMessage[] {
  return state.subAgents.get(subtaskId)?.messages ?? [];
}

/** Get a sub-agent's metrics summary */
export function selectSubAgentMetrics(
  state: SessionRunState,
  subtaskId: string
): {
  steps?: number;
  tokens?: { input: number; output: number; cacheRead: number; cacheWrite: number };
  duration?: number;
  status?: string;
  resultStatus?: string;
} {
  const sub = state.subAgents.get(subtaskId);
  if (!sub) return {};
  return {
    steps: sub.totalSteps,
    tokens: sub.tokens,
    duration: sub.duration,
    status: sub.status,
    resultStatus: sub.resultStatus,
  };
}

/** List all sub-agents */
export function selectAllSubAgents(state: SessionRunState): SubAgentRunState[] {
  return Array.from(state.subAgents.values());
}

/** Get the full event log (for cockpit event-log panel) */
export function selectEvents(state: SessionRunState): AgentEvent[] {
  return state.events;
}

/** Get cumulative token totals (main + all sub-agents) */
export function selectTotalTokens(state: SessionRunState) {
  let input = state.main.tokens.input;
  let output = state.main.tokens.output;
  let cacheRead = state.main.tokens.cacheRead;
  let cacheWrite = state.main.tokens.cacheWrite;
  for (const sub of state.subAgents.values()) {
    input += sub.tokens.input;
    output += sub.tokens.output;
    cacheRead += sub.tokens.cacheRead;
    cacheWrite += sub.tokens.cacheWrite;
  }
  return { input, output, cacheRead, cacheWrite };
}

/** Get the current run status */
export function selectStatus(state: SessionRunState): string {
  return state.main.status;
}

/** Get the current step count */
export function selectStepCount(state: SessionRunState): number {
  return state.main.stepCount;
}

/** Get the active skill name */
export function selectActiveSkill(state: SessionRunState): string | null {
  return state.main.activeSkill;
}

/** Latest todo-list snapshot (undefined until the first todo-list event) */
export function selectTodoList(state: SessionRunState) {
  return state.main.todoList;
}

// ─── Activity timeline ────────────────────────────────────────────

/** One entry in the derived activity timeline (a structured block). */
export interface ActivityTimelineEntry {
  id: string;
  type: 'thinking' | 'tool' | 'subagent';
  /** Tool name / sub-agent name; empty for thinking (UI supplies the label). */
  label: string;
  /** First string-ish tool argument, truncated (tools only). */
  detail?: string;
  status: 'running' | 'done' | 'error';
}

/**
 * Flatten the main agent's message blocks into an ordered activity timeline —
 * the "what is the agent doing" list (thinking → tools → sub-agents, in the
 * order they appear in the conversation). Derived from blocks, so it always
 * matches what the chat view renders. Consumers own the i18n.
 */
export function selectActivityTimeline(state: SessionRunState): ActivityTimelineEntry[] {
  const out: ActivityTimelineEntry[] = [];
  for (const m of state.main.messages) {
    for (const b of m.blocks ?? []) {
      if (b.type === 'thinking') {
        out.push({
          id: b.id,
          type: 'thinking',
          label: '',
          status: b.status === 'streaming' ? 'running' : 'done',
        });
      } else if (b.type === 'tool_call') {
        const rawArgs = typeof b.metadata?.toolArgs === 'string' ? b.metadata.toolArgs : '';
        let detail: string | undefined;
        if (rawArgs) {
          try {
            const parsed = JSON.parse(rawArgs) as Record<string, unknown>;
            const first = Object.values(parsed).find((v) => typeof v === 'string' && v.length > 0);
            if (typeof first === 'string') {
              detail = first.length > 80 ? `${first.slice(0, 80)}…` : first;
            }
          } catch {
            detail = rawArgs.length > 80 ? `${rawArgs.slice(0, 80)}…` : rawArgs;
          }
        }
        out.push({
          id: b.id,
          type: 'tool',
          label: String(b.metadata?.toolName ?? 'tool'),
          ...(detail !== undefined ? { detail } : {}),
          status: b.status === 'error' ? 'error' : b.status === 'streaming' ? 'running' : 'done',
        });
      } else if (b.type === 'subagent') {
        out.push({
          id: b.id,
          type: 'subagent',
          label: String(b.metadata?.name ?? 'sub-agent'),
          status: b.status === 'error' ? 'error' : b.status === 'streaming' ? 'running' : 'done',
        });
      }
    }
  }
  return out;
}
