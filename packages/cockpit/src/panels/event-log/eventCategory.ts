/**
 * Event type to UI category mapping and helpers
 */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  GitBranch,
  Brain,
  Type,
  Sparkles,
  Wrench,
  Zap,
  Users,
  Minimize2,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

import type { CockpitEventType, EventCategory } from './types.js';

/** Map raw event type to UI filter category */
export function getEventCategory(type: CockpitEventType): EventCategory {
  switch (type) {
    case 'step-start':
    case 'step-end':
    case 'complete':
    case 'done':
    case 'abort':
      return 'lifecycle';
    case 'phase-change':
      return 'phase';
    case 'thinking':
      return 'thinking';
    case 'token':
      return 'token';
    case 'llm-request':
    case 'llm-response':
      return 'llm';
    case 'tool-start':
    case 'tool-end':
    case 'tools-start':
    case 'tools-end':
      return 'tool';
    case 'skill-loading':
    case 'skill-loaded':
    case 'skill-start':
    case 'skill-end':
      return 'skill';
    case 'subagent-start':
    case 'subagent-end':
    case 'subagent-token':
    case 'subagent-thinking':
    case 'subagent-tool-start':
    case 'subagent-tool-end':
      return 'subagent';
    case 'compressing':
    case 'compressed':
      return 'compressing';
    case 'waiting-human':
    case 'human-input':
    case 'human-input-resolved':
    case 'user-message':
      return 'human';
    case 'error':
      return 'error';
  }
}

/** Get icon for event category */
export function getCategoryIcon(category: EventCategory): LucideIcon {
  switch (category) {
    case 'lifecycle':
      return Activity;
    case 'phase':
      return GitBranch;
    case 'thinking':
      return Brain;
    case 'token':
      return Type;
    case 'llm':
      return Sparkles;
    case 'tool':
      return Wrench;
    case 'skill':
      return Zap;
    case 'subagent':
      return Users;
    case 'compressing':
      return Minimize2;
    case 'human':
      return UserCheck;
    case 'error':
      return AlertCircle;
  }
}

/** All categories for filter bar */
export const ALL_CATEGORIES: EventCategory[] = [
  'lifecycle',
  'phase',
  'thinking',
  'token',
  'llm',
  'tool',
  'skill',
  'subagent',
  'compressing',
  'human',
  'error',
];

/** Get color pair for event type from theme */
export function getEventColor(type: CockpitEventType, theme: Theme) {
  const category = getEventCategory(type);
  return (
    theme.eventStatusColor[category] ?? {
      text: theme.color.textSecondary,
      bg: theme.color.fillTertiary,
    }
  );
}
