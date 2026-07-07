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
  ExpandableRow,
  PaginationBar,
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
  ExpandableRowProps,
  DetailVariant,
  PaginationBarProps,
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

export { PALETTE, hashId, getAvatarColor, getInitial } from './utils/avatar-color.js';

export { FONT_DISPLAY } from './utils/fonts.js';

export { DEFAULT_PAGE_SIZE } from './utils/pagination.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';
