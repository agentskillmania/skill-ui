# @agentskillmania/skill-ui-editor

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![English Documentation](https://img.shields.io/badge/docs-English-blue.svg)](./README.md)

@agentskillmania 的编辑域 —— 编辑核心 + 完整工作台。

## 安装

```bash
npm install @agentskillmania/skill-ui-editor
# 或
pnpm add @agentskillmania/skill-ui-editor
```

## 公共面

| 导出 | 说明 |
|---|---|
| `EditorWorkbench` | 完整受控工作台：文件树侧栏 + 页签 + 编辑区 + 状态栏（含打开/脏标记/保存/模式切换编排） |
| `EditorArea` | 模式切换壳 —— 代码 / 可视化 |
| `CodeEditor` | 基于 Monaco 的代码编辑器（Ctrl/Cmd+S） |
| `VisualEditor` | Milkdown Crepe 可视化编辑器（引擎懒加载） |
| `StatusBar` | 文件路径 / 脏标记 / 光标 / 编辑模式切换 |
| `EditMode` / `CursorPosition` / `EditorAreaProps` / `StatusBarProps` / `EditorWorkbenchProps` | 类型 |

文件浏览件（`FileTree`、`FileTabs`、`FileNode`、`FileKind` 等）在
[`@agentskillmania/skill-ui-shared`](../shared) —— 工作台从那里取用。

## i18n

导出 `NAMESPACE` / `resources` 供宿主注册（zh-CN / en-US）。

## License

MIT © [yusangeng](https://github.com/yusangeng)
