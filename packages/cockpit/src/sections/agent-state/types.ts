/**
 * Agent state types — runtime state extracted from colts AgentState
 * and daemon-level diagnostics.
 */

/**
 * Skill state from colts AgentContext.skillState.
 *
 * Note: colts' skill persistence redesign slimmed SkillState to just the
 * current skill name. The call stack and loaded instructions are no longer
 * part of SkillState — skill instructions now live in conversation history
 * as load_skill tool results, not in this runtime state.
 */
export interface SkillStateData {
  /** Currently active skill name, or null when idle. */
  current: string | null;
}

/** Compression state from colts AgentContext.compression */
export interface CompressionData {
  /** LLM-generated summary of compressed messages. */
  summary: string;
  /** Message index where the visible window starts (0-based). */
  anchor: number;
  /** Token count of the generated summary. */
  summaryTokenCount?: number;
  /** Token count removed by compression. */
  removedTokenCount?: number;
  /** Unix timestamp (ms) when compression occurred. */
  compressedAt?: number;
}

/** Props for the AgentStateSection container. */
export interface AgentStateSectionProps {
  /** Active skill state from colts AgentContext. */
  skillState?: SkillStateData | null;
  /** Current compression state from colts AgentContext. */
  compression?: CompressionData | null;
  /** Last LLM request snapshot from daemon (strict mapping). */
  llm?: { messages: unknown[]; tools?: unknown[] } | null;
}
