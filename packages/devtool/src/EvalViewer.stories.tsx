/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvalViewer } from './EvalViewer.js';
import type { EvalReport } from './types.js';

/** 样例报告（混合通过/失败/LLM 评分/多采样） */
const sampleReport: EvalReport = {
  suite: 'web-search-skill',
  runId: '2026-09-09T10-30-00_web-search-skill',
  target: { type: 'skill', path: './skills/web-search', skill: 'web-search' },
  sampling: { runs: 2, passThreshold: 0.5, temperature: 0 },
  startedAt: '2026-09-09T10:30:00.000Z',
  finishedAt: '2026-09-09T10:31:20.000Z',
  totalCases: 3,
  passed: 2,
  failed: 1,
  passRate: 2 / 3,
  cases: [
    {
      name: 'basic-greeting',
      passCount: 2,
      passed: true,
      samples: [
        {
          sampleIndex: 0,
          passed: true,
          results: [
            { name: 'output_contains', passed: true, message: 'found "hello"' },
            { name: 'step_count', passed: true, message: '2 steps within [1, 5]' },
          ],
        },
        {
          sampleIndex: 1,
          passed: true,
          results: [
            { name: 'output_contains', passed: true, message: 'found "hello"' },
            { name: 'step_count', passed: true, message: '3 steps within [1, 5]' },
          ],
        },
      ],
    },
    {
      name: 'search-invocation',
      passCount: 1,
      passed: true,
      samples: [
        {
          sampleIndex: 0,
          passed: true,
          results: [
            { name: 'tool_called', passed: true, message: 'web_search was called' },
            {
              name: 'thoroughness',
              passed: true,
              score: 4,
              message: 'answer covers all aspects of the query',
            },
          ],
        },
        {
          sampleIndex: 1,
          passed: false,
          results: [
            { name: 'tool_called', passed: false, message: 'web_search was NOT called' },
            {
              name: 'thoroughness',
              passed: true,
              score: 3,
              message: 'partial coverage',
            },
          ],
        },
      ],
    },
    {
      name: 'error-handling',
      passCount: 0,
      passed: false,
      samples: [
        {
          sampleIndex: 0,
          passed: false,
          results: [
            { name: 'output_not_contains', passed: false, message: 'found forbidden "I cannot"' },
            {
              name: 'robustness',
              passed: false,
              score: 1,
              message: 'no fallback strategy mentioned',
            },
          ],
        },
        {
          sampleIndex: 1,
          passed: false,
          results: [
            { name: 'output_not_contains', passed: false, message: 'found forbidden "I cannot"' },
            {
              name: 'robustness',
              passed: false,
              score: 2,
              message: 'mentions retry but no timeout policy',
            },
          ],
        },
      ],
    },
  ],
};

const meta: Meta<typeof EvalViewer> = {
  title: 'Devtool/EvalViewer',
  component: EvalViewer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EvalViewer>;

export const Default: Story = {
  args: { report: sampleReport },
  render: (args) => (
    <div style={{ height: 560, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <EvalViewer {...args} />
    </div>
  ),
};

export const AllPassed: Story = {
  args: {
    report: {
      ...sampleReport,
      suite: 'all-green-suite',
      totalCases: 1,
      passed: 1,
      failed: 0,
      passRate: 1,
      cases: [sampleReport.cases[0]],
    },
  },
  render: (args) => (
    <div style={{ height: 360, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <EvalViewer {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    report: {
      ...sampleReport,
      cases: [],
      totalCases: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
    },
  },
  render: (args) => (
    <div style={{ height: 300, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <EvalViewer {...args} />
    </div>
  ),
};
