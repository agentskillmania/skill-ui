# @agentskillmania/skill-ui-state

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-state.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transport-agnostic state layer for agent frontends. A pure conversation reducer plus a React hook — no UI components. Consumers fetch events however they like (SSE, REST, WebSocket, EventEmitter) and push them in.

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

  return <div>{/* render state.main.messages / blocks ... */}</div>;
}
```

The legacy alias `useSessionState` is also exported from the barrel.

### Reading state

```typescript
import {
  selectMainMessages,
  selectTotalTokens,
  selectStepCount,
  selectTodoList,
  selectLastInputTokens,
} from '@agentskillmania/skill-ui-state';

const messages = selectMainMessages(state);
const billing = selectTotalTokens(state); // main + sub-agents, cumulative
const contextNow = selectLastInputTokens(state); // current context window in use
```

## API Overview

- `reducer` — conversation event reducer (token / thinking / tool / skill / subagent events)
- `fromHistory` — rebuild conversation state from serialized history
- `useConversationState` / `useSessionState` — conversation React hook, returns `{ state, feed, reset, loadHistory }`
- Selectors — `selectMainMessages`, `selectTotalTokens`, `selectStepCount`, `selectTodoList`, `selectLastInputTokens`

## License

MIT
