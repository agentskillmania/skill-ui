/**
 * @fileoverview Selectors — query SessionRunState for specific consumers
 *
 * Pure functions that project the unified state into shapes
 * chat and cockpit UIs need. Consumers write their own mapping
 * layer on top of these (e.g. AgentMessage → chat package's Message).
 */

import type { SessionRunState, SubAgentRun, AgentMessage, AgentEvent } from './types.js';

/** Get the main agent's structured messages (for chat UI) */
export function selectMainMessages(state: SessionRunState): AgentMessage[] {
  return state.main.messages;
}

/** Get a sub-agent by subtaskId */
export function selectSubAgent(state: SessionRunState, subtaskId: string): SubAgentRun | undefined {
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
export function selectAllSubAgents(state: SessionRunState): SubAgentRun[] {
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
