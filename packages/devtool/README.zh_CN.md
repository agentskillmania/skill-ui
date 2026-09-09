# @agentskillmania/skill-ui-devtool

@agentskillmania 的 devtool UI 组件 —— 评估报告查看器。

## 安装

```bash
pnpm add @agentskillmania/skill-ui-devtool
```

## 使用

```tsx
import { EvalViewer, type EvalReport } from '@agentskillmania/skill-ui-devtool';

// report 来自 wrangler-devtool 的 runEval / CLI JSON 报告
<EvalViewer report={report} />
```

`EvalReport` 类型从 `@agentskillmania/wrangler-devtool` 做 type-only 再导出。

## License

MIT © [yusangeng](https://github.com/yusangeng)
