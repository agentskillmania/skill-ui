# @agentskillmania/skill-ui-editor

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![中文文档](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh_CN.md)

Editing domain for @agentskillmania — editor core plus the complete workbench.

## Installation

```bash
npm install @agentskillmania/skill-ui-editor
# or
pnpm add @agentskillmania/skill-ui-editor
```

## Public surface

| Export | Description |
|---|---|
| `EditorWorkbench` | Complete controlled workbench: file tree sidebar + tabs + editor area + status bar (open/dirty/save/mode orchestration included) |
| `EditorArea` | Mode switcher — code vs. wysiwyg |
| `CodeEditor` | Monaco-based code editor (Ctrl/Cmd+S) |
| `VisualEditor` | Milkdown Crepe visual editor (lazy-loaded engine) |
| `StatusBar` | File path / dirty flag / cursor / edit-mode toggle |
| `EditMode` / `CursorPosition` / `EditorAreaProps` / `StatusBarProps` / `EditorWorkbenchProps` | Types |

File browsing pieces (`FileTree`, `FileTabs`, `FileNode`, `FileKind`, …) live in
[`@agentskillmania/skill-ui-shared`](../shared) — the workbench consumes them from there.

## i18n

`NAMESPACE` / `resources` are exported for host registration (zh-CN / en-US).

## License

MIT © [yusangeng](https://github.com/yusangeng)
