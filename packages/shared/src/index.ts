/**
 * @agentskillmania/skill-ui-shared
 * Shared UI components, hooks, and style presets for the skill-ui ecosystem.
 */

// Components
export {
  SectionHeader,
  EmptyState,
  ExpandableItem,
  CollapsibleCard,
  SplitDivider,
  Sidebar,
  SidebarPanel,
  SidebarIcons,
} from './components/index.js';

// Component types
export type {
  SectionHeaderProps,
  EmptyStateProps,
  ExpandableItemProps,
  ExpandableItemContext,
  CollapsibleCardProps,
  SplitDividerProps,
  SidebarProps,
  SidebarPanelProps,
  SidebarIconsProps,
  SidebarIconItem,
} from './components/index.js';

// Hooks
export { useToggle, useResize } from './hooks/index.js';
export type { UseToggleReturn, UseResizeOptions, UseResizeReturn } from './hooks/index.js';

// Style presets
export {
  cardBodyTransition,
  cardHeaderInteractive,
  expandableDetailTransition,
  expandableSummaryHover,
} from './styles/index.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';
