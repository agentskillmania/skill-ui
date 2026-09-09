# @agentskillmania/skill-ui-chat

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-chat.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![English Documentation](https://img.shields.io/badge/docs-English-blue.svg)](./README.md)

@agentskillmania 的会话域 —— 聊天 UI 组件。

## 安装

```bash
npm install @agentskillmania/skill-ui-chat
# 或
pnpm add @agentskillmania/skill-ui-chat
```

## 公共面

| 导出 | 说明 |
|---|---|
| `Chat` | 一体式聊天（消息列表 + 输入框 + 工具栏） |
| `MessageList` | 消息列表（渲染器注册表 + 消息操作） |
| `ChatInput` | 输入组合件（快捷命令 / 模型选择 / 附件） |
| `BlocksRenderer` | 结构化块渲染（文本/思考/工具/计划/错误/…/子智能体） |
| `QuickCommands` | 快捷命令胶囊条（`/` 命令） |
| 全部 `Message`/`Block`/`ChatCommand`/metadata/Props 类型 | 类型契约 |

内置默认实现（消息子组件、各 Block、输入框子件、`CommandAutocomplete`、
`MarkdownRenderer`）为包内实现，不经公共面导出 —— 外部自定义走
`ChatRenderers` 注册表（`messages`/`blocks` 覆盖）。

## i18n

导出 `NAMESPACE` / `resources` 供宿主注册（zh-CN / en-US）。

## License

MIT © [yusangeng](https://github.com/yusangeng)
