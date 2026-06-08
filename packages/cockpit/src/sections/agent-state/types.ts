/**
 * Agent state types — runtime state extracted from colts AgentState
 * and daemon-level diagnostics.
 */

/** Skill state from colts AgentContext.skillState */
export interface SkillStateData {
  /** Currently active skill name, or null when idle. */
  current: string | null;
  /** Nested skill call stack (outermost first). */
  stack: SkillStackFrameData[];
  /** Loaded skill instructions text, if any. */
  loadedInstructions?: string;
}

/** Single frame in the skill call stack. */
export interface SkillStackFrameData {
  /** Skill name. */
  skillName: string;
  /** Unix timestamp (ms) when this skill was loaded. */
  loadedAt?: number;
  /** Opaque task context from the skill. */
  taskContext?: unknown;
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
