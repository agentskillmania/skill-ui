# @agentskillmania/skill-ui-devtool

Devtool UI components for @agentskillmania — eval report viewer and companions.

## Installation

```bash
pnpm add @agentskillmania/skill-ui-devtool
```

## Usage

```tsx
import { EvalViewer, type EvalReport } from '@agentskillmania/skill-ui-devtool';

// report comes from wrangler-devtool's runEval / CLI JSON report
<EvalViewer report={report} />
```

`EvalReport` is type-only re-exported from `@agentskillmania/wrangler-devtool`.

## License

MIT © [yusangeng](https://github.com/yusangeng)
