# @agentskillmania/skill-ui-shared

@agentskillmania skill-ui 生态的共享基础层 —— 按"面"组织，每个成员都有真实消费者。

## 安装

```bash
pnpm add @agentskillmania/skill-ui-shared
```

## 面

### files — 文件浏览域

编辑器工作台与宿主边窗共用的文件树 / 页签 / 预览 / 类型分类。

| 导出 | 说明 |
|---|---|
| `FileTree` | 文件树（目录展开/折叠 + 单选） |
| `FileTabs` | 文件页签（未保存标记 + 关闭按钮） |
| `FilePreview` | 只读预览 —— markdown 经 `@ant-design/x-markdown` 渲染，代码/文本为 `<pre>` |
| `FileTypeIcon` | 扩展名驱动的 lucide 图标（markdown/code/image/doc/file） |
| `getFileKind` | 行为分类：`'code' \| 'markdown' \| 'image' \| 'file'` |
| `getFileLabel` | 路径最后一段 |
| `FileNode` / `FileTab` / `FileTreeProps` / `FileTabsProps` / `FilePreviewProps` | 类型 |

### display

| 导出 | 说明 |
|---|---|
| `EmptyState` | 基于 antd Empty 的空态占位 |

### utils

| 导出 | 说明 |
|---|---|
| `formatTokens` | 紧凑 token 计数 —— `1200 → "1.2k"`，`1500000 → "1.5M"` |
| `formatDuration` | 毫秒时长 —— `1500 → "1.5s"`，`42 → "42ms"` |

## i18n

导出 `NAMESPACE` / `resources` 供宿主注册（zh-CN / en-US）。

## License

MIT © [yusangeng](https://github.com/yusangeng)
