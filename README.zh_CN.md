# @agentskillmania/skill-ui

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-workspace.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-workspace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/agentskillmania/skill-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/agentskillmania/skill-ui/actions/workflows/ci.yml)
[![English Documentation](https://img.shields.io/badge/docs-English-blue.svg)](./README.md)

@agentskillmania 生态的 UI 组件 monorepo。

## 包列表

| 包名 | 说明 | 版本 |
|---|---|---|
| `@agentskillmania/skill-ui-theme` | 主题与样式工具 | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-theme.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-theme) |
| `@agentskillmania/skill-ui-state` | 智能体运行时的事件归约状态机 | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-state.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-state) |
| `@agentskillmania/skill-ui-shared` | 共享基础层 — 文件浏览域（树/页签/预览）、展示件、格式化工具 | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-shared.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-shared) |
| `@agentskillmania/skill-ui-chat` | 会话 UI — Chat、MessageList、ChatInput、BlocksRenderer、QuickCommands | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-chat.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-chat) |
| `@agentskillmania/skill-ui-editor` | 编辑域 — EditorArea/CodeEditor/VisualEditor/StatusBar + EditorWorkbench 工作台 | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor) |
| `@agentskillmania/skill-ui-devtool` | devtool UI — 评估报告查看器（EvalViewer） | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-devtool.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-devtool) |

## 开发

需要 **pnpm >= 9** 和 **Node.js >= 18**。

```bash
pnpm install
pnpm build
pnpm test:unit
pnpm lint
```

## 协议

MIT © [yusangeng](https://github.com/yusangeng)
