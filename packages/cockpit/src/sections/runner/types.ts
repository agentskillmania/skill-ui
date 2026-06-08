/**
 * Runner section types — frontend data structures for runner diagnostics.
 * Maps to RunnerDiagnostics from wrangler-daemon session-diagnostics.
 */

/** Feature flag state from runner config. */
export interface RunnerFeatureFlags {
  sandbox?: boolean;
  thinkingEnabled?: boolean;
  enablePromptThinking?: boolean;
  a2uiEnabled?: boolean;
  compressorEnabled?: boolean;
  enableSession?: boolean;
  enableTodolist?: boolean;
  enableCommands?: boolean;
}

/** Tool info from runner diagnostics. */
export interface RunnerToolInfo {
  name: string;
  description?: string;
  type?: string;
  enabled?: boolean;
}

/** Skill info from runner diagnostics. */
export interface RunnerSkillInfo {
  name: string;
  description?: string;
  source?: string;
}

/** Runner diagnostics data from daemon. */
export interface RunnerDiagnosticsData {
  features?: RunnerFeatureFlags | null;
  tools?: RunnerToolInfo[] | null;
  skills?: RunnerSkillInfo[] | null;
}

/** Props for RunnerSection container. */
export interface RunnerSectionProps {
  runner?: RunnerDiagnosticsData | null;
}
