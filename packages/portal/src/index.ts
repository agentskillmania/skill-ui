/**
 * @agentskillmania/skill-ui-portal
 */

// Types
export type {
  AgentItem,
  SkillItem,
  SessionItem,
  SearchResultType,
  SearchResultItemData,
  SearchResults,
  PortalTab,
  PortalProps,
} from './types.js';

// Components
export { Portal } from './components/Portal/index.js';
export { PortalHeader } from './components/PortalHeader/index.js';
export { AgentCard } from './components/AgentCard/index.js';
export { SkillCard } from './components/SkillCard/index.js';
export { SessionRow } from './components/SessionRow/index.js';
export { AgentSection } from './components/AgentSection/index.js';
export { SkillSection } from './components/SkillSection/index.js';
export { SessionSection } from './components/SessionSection/index.js';

// Shared components
export { ResourceAvatar } from './components/ResourceAvatar/index.js';
export { HighlightText } from './components/HighlightText/index.js';
export { SearchResultItem } from './components/SearchResultItem/index.js';

// Hooks
export { usePortalFilter } from './hooks/index.js';

// i18n
export { NAMESPACE, resources } from './locales/index.js';
