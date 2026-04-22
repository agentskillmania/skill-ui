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
| `@agentskillmania/skill-ui-chat` | Chat UI components — message list, input, execution blocks | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-chat.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-chat) |
| `@agentskillmania/skill-ui-editor` | Skill editor — file tree, code editor, visual editor | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor) |
| `@agentskillmania/skill-ui-frame` | App frame — titlebar, panels, sidebar | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-frame.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-frame) |
| `@agentskillmania/skill-ui-settings` | Settings UI — configuration panels | [![npm](https://img.shields.io/npm/v/@agentskillmania/skill-ui-settings.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-settings) |

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
