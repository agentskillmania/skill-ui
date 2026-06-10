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
  MetricTile,
  SectionLabel,
  StatusDot,
  CopyValue,
  InfoRow,
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
  MetricTileProps,
  SectionLabelProps,
  StatusDotProps,
  CopyValueProps,
  InfoRowProps,
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
  metricsRow,
  metricGrid,
} from './styles/index.js';

// Utils
export {
  formatRelativeTime,
  formatTokens,
  formatNumber,
  truncate,
  formatTimestamp,
} from './utils/format.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';
