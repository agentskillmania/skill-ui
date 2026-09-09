# @agentskillmania/skill-ui-shared

Shared foundation for @agentskillmania skill-ui packages — organized by faces, every member has real consumers.

## Installation

```bash
pnpm add @agentskillmania/skill-ui-shared
```

## Faces

### files — file browsing domain

File tree / tabs / preview / type classification shared by the editor workbench and host side panels.

| Export | Description |
|---|---|
| `FileTree` | File tree with directory expand/collapse and single selection |
| `FileTabs` | File tabs with dirty indicator and close button |
| `FilePreview` | Read-only preview — markdown rendered via `@ant-design/x-markdown`, code/text as `<pre>` |
| `FileTypeIcon` | Extension-driven lucide icon (markdown/code/image/doc/file) |
| `getFileKind` | Behavior classification: `'code' \| 'markdown' \| 'image' \| 'file'` |
| `getFileLabel` | Basename of a path |
| `FileNode` / `FileTab` / `FileTreeProps` / `FileTabsProps` / `FilePreviewProps` | Types |

### display

| Export | Description |
|---|---|
| `EmptyState` | Empty placeholder based on antd Empty |

### utils

| Export | Description |
|---|---|
| `formatTokens` | Compact token counts — `1200 → "1.2k"`, `1500000 → "1.5M"` |
| `formatDuration` | Milliseconds — `1500 → "1.5s"`, `42 → "42ms"` |

## i18n

`NAMESPACE` / `resources` are exported for host registration (zh-CN / en-US).

## License

MIT © [yusangeng](https://github.com/yusangeng)
