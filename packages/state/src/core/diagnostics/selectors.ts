/**
 * @fileoverview Diagnostics selectors — query DiagnosticsState
 *
 * Pure functions projecting the snapshot diagnostics state into shapes
 * the cockpit session-board UI reads from. Consumers may compose these
 * with their own mapping layers.
 */

import type {
  DiagnosticsState,
  DiagnosticsRunnerState,
  DiagnosticsSessionOverview,
  DiagnosticsSessionInfo,
  DiagnosticsFeatureFlags,
  DiagnosticsToolMeta,
  DiagnosticsSkillMeta,
} from './types.js';

export function selectDiagnosticsRunner(state: DiagnosticsState): DiagnosticsRunnerState | null {
  return state.runner;
}

export function selectDiagnosticsTools(state: DiagnosticsState): DiagnosticsToolMeta[] {
  return state.runner?.tools ?? [];
}

export function selectDiagnosticsSkills(state: DiagnosticsState): DiagnosticsSkillMeta[] {
  return state.runner?.skills ?? [];
}

export function selectDiagnosticsFeatures(state: DiagnosticsState): DiagnosticsFeatureFlags | null {
  return state.runner?.features ?? null;
}

export function selectDiagnosticsOverview(
  state: DiagnosticsState
): DiagnosticsSessionOverview | null {
  return state.session.overview;
}

export function selectDiagnosticsInfo(state: DiagnosticsState): DiagnosticsSessionInfo | null {
  return state.session.info;
}

export function selectDiagnosticsLLM(state: DiagnosticsState): DiagnosticsState['llm'] {
  return state.llm;
}

export function selectDiagnosticsSystemPrompt(state: DiagnosticsState): string | null {
  return state.systemPrompt;
}

export function selectDiagnosticsAgent(state: DiagnosticsState): Record<string, unknown> | null {
  return state.agent;
}
