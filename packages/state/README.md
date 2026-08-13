# @agentskillmania/skill-ui-state

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-state.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transport-agnostic state layer for agent frontends. Pure reducers, normalizers, and React hooks — no UI components. Consumers fetch events however they like (SSE, REST, WebSocket, EventEmitter) and push them in.

## Installation

```bash
pnpm add @agentskillmania/skill-ui-state
```

Requires React 19 (peer dependency).

## Usage

### Conversation state

```typescript
import { useConversationState } from '@agentskillmania/skill-ui-state';

function Chat() {
  const { state, feed, reset, loadHistory } = useConversationState();

  // Upper layer is responsible for obtaining events (SSE reader, EventEmitter
  // listener, ...) and pushing them into the feed:
  //   feed.push(sseEvent)
  //   reset()            — back to an empty session
  //   loadHistory(state) — rebuild from serialized history

  return <div>{/* render state.messages / state.blocks ... */}</div>;
}
```

The legacy alias `useSessionState` is also exported from the barrel.

### Diagnostics state

```typescript
import { useDiagnosticsState } from '@agentskillmania/skill-ui-state';

const { state, feed, reset } = useDiagnosticsState();
```

### Resource normalizers (no React needed)

```typescript
import {
  normalizeSession,
  normalizeAgent,
  normalizeSkill,
  normalizeCrew,
  findFileNode,
  flattenTree,
} from '@agentskillmania/skill-ui-state';

const session = normalizeSession(raw);
const skills = normalizeSkillList(rawSkills);
const tree = flattenTree(findFileNode(fileTree, '/'));
```

## API Overview

- `reducer` — conversation event reducer (token / thinking / tool / skill / subagent events)
- `fromHistory` — rebuild conversation state from serialized history
- `diagnosticsReducer` — agent-diagnostics snapshot reducer
- `normalizeSession(List)`, `normalizeAgent(List)`, `normalizeSkill(List)`, `normalizeCrew(List)` — typed resource normalizers
- `findFileNode`, `toggleDirExpanded`, `flattenTree` — file-tree helpers
- `useConversationState` / `useSessionState` — conversation React hook, returns `{ state, feed, reset, loadHistory }`
- `useDiagnosticsState`, `useResourceState` — diagnostics / resources React hooks

## License

MIT
