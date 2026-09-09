# @agentskillmania/skill-ui-theme

[![npm version](https://img.shields.io/npm/v/@agentskillmania/skill-ui-theme.svg)](https://www.npmjs.com/package/@agentskillmania/skill-ui-theme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![中文文档](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh_CN.md)

Theme foundation for @agentskillmania UI packages — tokens, provider, style utilities, and Ant Design adapters.

## Installation

```bash
npm install @agentskillmania/skill-ui-theme
# or
pnpm add @agentskillmania/skill-ui-theme
```

## Public surface

| Group | Exports |
|---|---|
| Provider | `ThemeProvider`, `useTheme`, `createEmotionTheme`, `GlobalStyles` |
| Tokens | `getTheme`, `lightTheme`/`darkTheme`, `lightColor`/`darkColor`, `lightEventStatusColor`/`darkEventStatusColor`, `lightAgentStatusColor`/`darkAgentStatusColor`, `lightSkillStatusColor`/`darkSkillStatusColor`, `breakpoints` |
| Registry | `themeRegistry`, `themeMetas`, `resolveThemeId`, `defaultThemeId`, `ThemeId`, `ThemeMeta` |
| Ant Design | `createAntdConfig`, `getAntdConfig`, `lightAntdConfig`, `darkAntdConfig`, `getAntdXTokens`, `lightAntdXTokens`, `darkAntdXTokens` |
| Constants | `layout`, `zIndex` |
| Style utils | `flexColumn`/`flexRow`/`flexCenter`/`flexWrap`/`gridAutoFill`, `glassEffect`, `card`, `borderDefault`/`borderAccent`, `hoverPrimary`/`hoverBg`, `disabled`, `focusVisible`, `transition`, `spin`/`spinKeyframes`, `scaleActive`, `textTruncate`/`textSecondary`, `iconBox`, `scrollable`/`scrollContainer`, `absoluteFill`, `interactiveItem`/`interactiveRow`, `subtleBackground`, `borderSeparator`, `media`, `container` |
| Types | `Theme`, `EventStatusColorItem`, `AgentStatusColorItem` |

## License

MIT © [yusangeng](https://github.com/yusangeng)
