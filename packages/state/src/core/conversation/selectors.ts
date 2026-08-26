/**
 * @fileoverview Selectors — query SessionRunState for specific consumers
 *
 * Pure functions that project the unified state into shapes
 * chat UIs need. Consumers write their own mapping
 * layer on top of these (e.g. AgentMessage → chat package's Message).
 */

import type { SessionRunState, AgentMessage } from './types.js';

/** Get the main agent's structured messages (for chat UI) */
export function selectMainMessages(state: SessionRunState): AgentMessage[] {
  return state.main.messages;
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

/** Get the current step count */
export function selectStepCount(state: SessionRunState): number {
  return state.main.stepCount;
}

/** Latest todo-list snapshot (undefined until the first todo-list event) */
export function selectTodoList(state: SessionRunState) {
  return state.main.todoList;
}

/** Input tokens of the last LLM call — the context window currently in use.
 *  Distinct from cumulative `selectTotalTokens` (billing total). */
export function selectLastInputTokens(state: SessionRunState): number | undefined {
  return state.main.lastInputTokens;
}
