# @agentskillmania/skill-ui-portal

Portal/home page UI components for the AgentSkillMania ecosystem.

## Components

- `Portal` — Main container with tabs, search, and resource grids/lists
- `AgentCard` — Agent information card with chat/edit/delete actions
- `SkillCard` — Skill information card with chat/edit/delete actions
- `SessionRow` — Session list row with resume/delete actions
- `PortalHeader` — Brand banner + global search

## Hooks

- `usePortalFilter` — Client-side filtering and search result generation

## Usage

```tsx
import { Portal, usePortalFilter } from '@agentskillmania/skill-ui-portal';

function MyPage() {
  const [activeTab, setActiveTab] = useState('skills');
  // ... all state managed by consumer

  return (
    <Portal
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // ... all other props
    />
  );
}
```

## Design Principle

**Pure controlled component.** The Portal never manages data-related state internally.
All tab switching, searching, and pagination is controlled via props.
