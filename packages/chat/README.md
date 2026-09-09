# @agentskillmania/skill-ui-chat

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-chat.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![中文文档](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh_CN.md)

Chat domain for @agentskillmania — conversation UI components.

## Installation

```bash
npm install @agentskillmania/skill-ui-chat
# or
pnpm add @agentskillmania/skill-ui-chat
```

## Public surface

| Export | Description |
|---|---|
| `Chat` | All-in-one chat (message list + input + toolbar) |
| `MessageList` | Message list with renderer registry + message actions |
| `ChatInput` | Composer with quick commands / model picker / attachments |
| `BlocksRenderer` | Structured block rendering (text/thinking/tool/plan/error/…/subagent) |
| `QuickCommands` | Quick-command capsule bar (`/` commands) |
| All `Message`/`Block`/`ChatCommand`/metadata/Props types | Type contracts |

Built-in default implementations (message subcomponents, individual blocks,
composer sub-widgets, `CommandAutocomplete`, `MarkdownRenderer`) are internal —
customize via the `ChatRenderers` registry (`messages`/`blocks` overrides).

## i18n

`NAMESPACE` / `resources` are exported for host registration (zh-CN / en-US).

## License

MIT © [yusangeng](https://github.com/yusangeng)
