/**
 * @agentskillmania/skill-ui-devtool type definitions
 *
 * EvalReport 的权威定义在 @agentskillmania/wrangler-devtool ——
 * 这里做 type-only 再导出，让消费者从本包一步到位。
 */
export type {
  EvalReport,
  CaseReport,
  SampleResult,
  EvalResult,
  EvalSampling,
  EvalTarget,
} from '@agentskillmania/wrangler-devtool';
