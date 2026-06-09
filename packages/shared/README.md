# @agentskillmania/skill-ui-shared

Shared UI components, hooks, and style presets for the @agentskillmania skill-ui ecosystem.

## Installation

```bash
pnpm add @agentskillmania/skill-ui-shared
```

## Components

| Component | Description |
|-----------|-------------|
| `Sidebar` | Right-side collapsible sidebar shell |
| `SidebarPanel` | Panel container with title bar + scrollable body |
| `SidebarIcons` | Vertical icon bar for panel switching |
| `CollapsibleCard` | antd Card (size="small") with collapse toggle |
| `SectionHeader` | Icon + uppercase label + bottom divider |
| `EmptyState` | Placeholder based on antd Empty |
| `ExpandableItem` | Headless expandable list item container |
| `SplitDivider` | 4px draggable vertical divider |

## Hooks

| Hook | Description |
|------|-------------|
| `useToggle` | Boolean state with set/toggle/reset |
| `useResize` | Drag-based width resizing |

## Style Presets

| Preset | Description |
|--------|-------------|
| `cardBodyTransition` | Card body collapse/expand animation |
| `cardHeaderInteractive` | Card header cursor + hover styles |
| `expandableDetailTransition` | Expandable detail area animation |
| `expandableSummaryHover` | Summary row hover styles |

## i18n

Exports `NAMESPACE` (`skill-ui-shared`) and `resources` for zh-CN / en-US locales.

## Peer Dependencies

- `@agentskillmania/skill-ui-theme`
- `react`, `react-dom`
- `antd` (^6.0.0)
- `lucide-react`
- `@emotion/react`
- `react-i18next`
