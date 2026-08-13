# @agentskillmania/skill-ui-cockpit

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-cockpit.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-cockpit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Multi-panel cockpit layout for agent frontends — chat, event log, session board, and session list in one resizable workspace. Built on antd, emotion, and `@agentskillmania/skill-ui-*` packages.

## Installation

```bash
pnpm add @agentskillmania/skill-ui-cockpit
```

Peers you must provide: `react@^19`, `react-dom@^19`, `antd@^6`, `i18next@^24`, `react-i18next@^15`.

## Usage

```tsx
import { Cockpit } from '@agentskillmania/skill-ui-cockpit';

export function App() {
  return (
    <Cockpit
      chatMessages={messages}
      onChatSendMessage={send}
      onChatStop={stop}
      chatInputValue={input}
      onChatInputChange={setInput}
      chatStatus={status}
      // ... session board / event log / sessions props, see CockpitProps
    />
  );
}
```

All props are namespaced by panel (`chat*`, `eventLog*`, `sessionBoard*`, `sessions*`) — see the `CockpitProps` type for the full surface.

## Exports

- `Cockpit` — full multi-panel cockpit component
- `useCockpitLayout` — panel layout state hook
- Panels: `ChatPanel`, `EventLogPanel`, `SessionBoardPanel`, `SessionsPanel`
- Event log pieces: `EventFilterBar`, `EventRow`
- Session sections: `SessionSection`, `SessionOverviewCard`, `SessionInfoCard`

## License

MIT
