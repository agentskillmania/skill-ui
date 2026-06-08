/**
 * Shared types for chat-demo client
 */
import type { AgentCard, SkillCard, SessionCard } from '@agentskillmania/skill-ui-frame';

/** Route state for client-side navigation */
export type Route = { page: 'launcher' } | { page: 'workspace'; sessionId: string };

/** View mode within a workspace */
export type ViewMode = 'cockpit' | 'editor';

/** Agent info from launcher API — maps to AgentCard */
export type DemoAgent = AgentCard;

/** Skill info from launcher API — maps to SkillCard */
export type DemoSkill = SkillCard;

/** Session info from launcher API — maps to SessionCard */
export type DemoSession = SessionCard;

/** Launcher API response */
export interface LauncherData {
  agents: DemoAgent[];
  skills: DemoSkill[];
  sessions: DemoSession[];
}
