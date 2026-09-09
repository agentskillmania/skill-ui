# @agentskillmania/skill-ui-theme

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-theme.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-theme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![English Documentation](https://img.shields.io/badge/docs-English-blue.svg)](./README.md)

@agentskillmania UI 包的主题地基 —— tokens、Provider、样式工具与 Ant Design 适配器。

## 安装

```bash
npm install @agentskillmania/skill-ui-theme
# 或
pnpm add @agentskillmania/skill-ui-theme
```

## 公共面

| 分组 | 导出 |
|---|---|
| Provider | `ThemeProvider`、`useTheme`、`createEmotionTheme`、`GlobalStyles` |
| Tokens | `getTheme`、`lightTheme`/`darkTheme`、`lightColor`/`darkColor`、`lightEventStatusColor`/`darkEventStatusColor`、`lightAgentStatusColor`/`darkAgentStatusColor`、`lightSkillStatusColor`/`darkSkillStatusColor`、`breakpoints` |
| 注册表 | `themeRegistry`、`themeMetas`、`resolveThemeId`、`defaultThemeId`、`ThemeId`、`ThemeMeta` |
| Ant Design | `createAntdConfig`、`getAntdConfig`、`lightAntdConfig`、`darkAntdConfig`、`getAntdXTokens`、`lightAntdXTokens`、`darkAntdXTokens` |
| 常量 | `layout`、`zIndex` |
| 样式工具 | `flexColumn`/`flexRow`/`flexCenter`/`flexWrap`/`gridAutoFill`、`glassEffect`、`card`、`borderDefault`/`borderAccent`、`hoverPrimary`/`hoverBg`、`disabled`、`focusVisible`、`transition`、`spin`/`spinKeyframes`、`scaleActive`、`textTruncate`/`textSecondary`、`iconBox`、`scrollable`/`scrollContainer`、`absoluteFill`、`interactiveItem`/`interactiveRow`、`subtleBackground`、`borderSeparator`、`media`、`container` |
| 类型 | `Theme`、`EventStatusColorItem`、`AgentStatusColorItem` |

## 协议

MIT © [yusangeng](https://github.com/yusangeng)
