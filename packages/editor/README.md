# @agentskillmania/skill-ui-editor

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-editor.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![中文文档](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh_CN.md)

Skill editor UI components for @agentskillmania — file tree, code editor, visual editor, toolbars.

## Installation

```bash
npm install @agentskillmania/skill-ui-editor
# or
pnpm add @agentskillmania/skill-ui-editor
```

## Usage

```tsx
import {
  // Side-window file browser: derive artifacts from session messages, map the
  // daemon workspace tree, and render the browser (breakpoint layout — the
  // container width is the only control variable, no inner drag handle).
  FileBrowser,
  deriveArtifacts,
  daemonTreeToProjectFiles,
} from '@agentskillmania/skill-ui-editor';

const artifacts = deriveArtifacts(messages); // scan file_write / file_edit toolCalls
const files = daemonTreeToProjectFiles(treeResponse); // GET /api/files/:id/tree → FileTree shape

<FileBrowser
  workspaceFiles={files}
  artifacts={artifacts}
  activePath={path}
  activeContent={content}
  onActivePathChange={setPath}
/>;
```

## License

MIT © [yusangeng](https://github.com/yusangeng)
