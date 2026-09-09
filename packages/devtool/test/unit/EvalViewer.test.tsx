/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

import { EvalViewer } from '../../src/EvalViewer.js';
import type { EvalReport } from '../../src/types.js';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const report: EvalReport = {
  suite: 'web-search-skill',
  runId: '2026-09-09T10-30-00_web-search-skill',
  target: { type: 'skill', path: './skills/web-search', skill: 'web-search' },
  sampling: { runs: 2, passThreshold: 0.5 },
  startedAt: '2026-09-09T10:30:00.000Z',
  finishedAt: '2026-09-09T10:31:20.000Z',
  totalCases: 2,
  passed: 1,
  failed: 1,
  passRate: 0.5,
  cases: [
    {
      name: 'basic-greeting',
      passCount: 2,
      passed: true,
      samples: [
        {
          sampleIndex: 0,
          passed: true,
          results: [{ name: 'output_contains', passed: true, message: 'found "hello"' }],
        },
        {
          sampleIndex: 1,
          passed: true,
          results: [{ name: 'output_contains', passed: true, message: 'found "hello"' }],
        },
      ],
    },
    {
      name: 'search-invocation',
      passCount: 0,
      passed: false,
      samples: [
        {
          sampleIndex: 0,
          passed: false,
          results: [
            { name: 'tool_called', passed: false, message: 'web_search was NOT called' },
            { name: 'thoroughness', passed: true, score: 3, message: 'partial coverage' },
          ],
        },
      ],
    },
  ],
};

describe('EvalViewer', () => {
  it('renders suite name and pass rate', () => {
    render(<EvalViewer report={report} />, { wrapper });
    expect(screen.getByText('web-search-skill')).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('renders run metadata (runId, sampling, target)', () => {
    render(<EvalViewer report={report} />, { wrapper });
    expect(screen.getByText(/2026-09-09T10-30-00_web-search-skill/)).toBeInTheDocument();
    expect(screen.getByText(/skill \(web-search\)/)).toBeInTheDocument();
  });

  it('renders case names in the accordion', () => {
    render(<EvalViewer report={report} />, { wrapper });
    expect(screen.getByText('basic-greeting')).toBeInTheDocument();
    expect(screen.getByText('search-invocation')).toBeInTheDocument();
  });

  it('renders case pass counts', () => {
    render(<EvalViewer report={report} />, { wrapper });
    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });

  it('renders empty state when no cases', () => {
    render(<EvalViewer report={{ ...report, cases: [], totalCases: 0, passed: 0, failed: 0 }} />, {
      wrapper,
    });
    expect(screen.getByText('报告中没有用例')).toBeInTheDocument();
  });

  it('expands case to show samples and evaluator results', async () => {
    render(<EvalViewer report={report} />, { wrapper });
    // Collapse panels render children lazily — open the case and await content
    const caseHeader = screen.getByText('search-invocation');
    fireEvent.click(caseHeader);
    expect(await screen.findByText(/web_search was NOT called/)).toBeInTheDocument();
    expect(await screen.findByText(/partial coverage/)).toBeInTheDocument();
  });
});
