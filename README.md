# @agentskillmania/skill-ui

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-workspace.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-workspace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/agentskillmania/skill-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/agentskillmania/skill-ui/actions/workflows/ci.yml)
[![中文文档](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh_CN.md)

A pnpm monorepo workspace managing UI component packages for the @agentskillmania ecosystem.

## Packages

| Package | Description | Version |
|---|---|---|
| `@agentskillmania/skill-ui-theme` | Theme and style utilities | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-theme.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-theme) |
| `@agentskillmania/skill-ui-state` | Event-reducer state machine for agent runtimes | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-state.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-state) |
| `@agentskillmania/skill-ui-shared` | Shared foundation — files domain (tree/tabs/preview), display, format utils | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-shared.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-shared) |
| `@agentskillmania/skill-ui-chat` | Chat UI — Chat, MessageList, ChatInput, BlocksRenderer, QuickCommands | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-chat.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-chat) |
| `@agentskillmania/skill-ui-editor` | Editing domain — EditorArea/CodeEditor/VisualEditor/StatusBar + EditorWorkbench | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor) |
| `@agentskillmania/skill-ui-devtool` | Devtool UI — eval report viewer (EvalViewer) | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-devtool.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-devtool) |

## Development

Requires **pnpm >= 9** and **Node.js >= 18**.

```bash
pnpm install
pnpm build
pnpm test:unit
pnpm lint
```

## License

MIT © [yusangeng](https://github.com/yusangeng)
