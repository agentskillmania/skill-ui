/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { ReviewPanel } from '../../src/components/ReviewPanel/ReviewPanel.js';
import type { ReviewResult } from '../../src/types.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const sampleResult: ReviewResult = {
  score: 85,
  items: [
    { status: 'pass', label: '描述清晰' },
    { status: 'pass', label: '步骤完整' },
    { status: 'warn', label: '建议补充错误处理', detail: '当前未处理 API 超时场景' },
    { status: 'fail', label: '未定义超时策略' },
  ],
};

describe('ReviewPanel', () => {
  it('无审核结果时显示空状态', () => {
    renderWithTheme(<ReviewPanel />);
    expect(screen.getByText('尚未审核，通过助手发起审核')).toBeTruthy();
  });

  it('显示审核评分', () => {
    renderWithTheme(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('85')).toBeTruthy();
    expect(screen.getByText('/ 100')).toBeTruthy();
  });

  it('显示所有检查项', () => {
    renderWithTheme(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('描述清晰')).toBeTruthy();
    expect(screen.getByText('步骤完整')).toBeTruthy();
    expect(screen.getByText('建议补充错误处理')).toBeTruthy();
    expect(screen.getByText('未定义超时策略')).toBeTruthy();
  });

  it('显示检查项详细说明', () => {
    renderWithTheme(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('当前未处理 API 超时场景')).toBeTruthy();
  });

  it('空检查项列表正常渲染', () => {
    renderWithTheme(<ReviewPanel result={{ score: 100, items: [] }} />);
    expect(screen.getByText('100')).toBeTruthy();
  });
});
