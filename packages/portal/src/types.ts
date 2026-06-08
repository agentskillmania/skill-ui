/**
 * @agentskillmania/skill-ui-portal type definitions
 */

import type { ReactNode } from 'react';

// ── Data Models ──

export interface AgentItem {
  id: string;
  name: string;
  description?: string;
  source: 'builtin' | 'custom';
  skillCount: number;
  icon?: ReactNode;
}

export interface SkillItem {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
}

export interface SessionItem {
  id: string;
  agentId: string;
  agentName: string;
  workspacePath: string;
  lastActive: string;
  tokenCount: number;
}

// ── Search ──

export type SearchResultType = 'agent' | 'skill' | 'session';

export interface SearchResultItemData {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
}

export interface SearchResults {
  agents: SearchResultItemData[];
  skills: SearchResultItemData[];
  sessions: SearchResultItemData[];
}

// ── Portal ──

export type PortalTab = 'agents' | 'skills' | 'sessions';

export interface PortalProps {
  activeTab?: PortalTab;
  onTabChange?: (tab: PortalTab) => void;
  githubUrl?: string;

  searchResults: SearchResults;
  onSearch: (query: string) => void;
  onSearchSelect?: (type: SearchResultType, id: string) => void;
  onSearchEdit?: (type: SearchResultType, id: string) => void;

  agents: AgentItem[];
  agentsPage: number;
  agentsTotal: number;
  agentsPageSize?: number;
  onAgentsPageChange: (page: number) => void;

  skills: SkillItem[];
  skillsPage: number;
  skillsTotal: number;
  skillsPageSize?: number;
  onSkillsPageChange: (page: number) => void;

  sessions: SessionItem[];
  sessionsPage: number;
  sessionsTotal: number;
  sessionsPageSize?: number;
  onSessionsPageChange: (page: number) => void;

  onAgentChat: (id: string) => void;
  onAgentEdit: (id: string) => void;
  onAgentCreate: (name: string) => void;
  onAgentDelete: (id: string) => void;

  onSkillChat: (id: string) => void;
  onSkillEdit: (id: string) => void;
  onSkillCreate: (name: string) => void;
  onSkillDelete: (id: string) => void;

  onSessionResume: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onSessionFork?: (id: string) => void;
  onSessionClear: () => void;
}
