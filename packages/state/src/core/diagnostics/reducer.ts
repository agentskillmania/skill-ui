/**
 * @fileoverview Diagnostics reducer — SSE event → DiagnosticsState
 *
 * Pure function: (state, event) → state.
 *
 * Snapshot semantics: every 'agent-diagnostics' event carries a complete
 * snapshot of the agent's runtime diagnostics (runner, agent, llm,
 * systemPrompt, session), so each such event replaces the entire state.
 * Non-diagnostics events are ignored (returned unchanged), and malformed
 * payloads (empty/null data) preserve the last known state.
 */

import type { SSEEvent } from '../types.js';
import { DIAGNOSTICS_EVENT } from './types.js';
import type { DiagnosticsState } from './types.js';

export function diagnosticsReducer(state: DiagnosticsState, event: SSEEvent): DiagnosticsState {
  if (event.event !== DIAGNOSTICS_EVENT) {
    return state;
  }
  const data = event.data;
  if (!data || Object.keys(data).length === 0) {
    return state;
  }
  return {
    runner: (data.runner as DiagnosticsState['runner']) ?? null,
    agent: (data.agent as DiagnosticsState['agent']) ?? null,
    llm: (data.llm as DiagnosticsState['llm']) ?? null,
    systemPrompt: (data.systemPrompt as string | null | undefined) ?? null,
    session: {
      overview:
        (data.session as { overview?: DiagnosticsState['session']['overview'] })?.overview ?? null,
      info: (data.session as { info?: DiagnosticsState['session']['info'] })?.info ?? null,
    },
  };
}
