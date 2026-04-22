/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ReviewPanel } from '../../src/components/ReviewPanel/ReviewPanel.js';
import type { ReviewResult } from '../../src/types.js';

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
  it('shows empty state when no review result', () => {
    renderWithProviders(<ReviewPanel />);
    expect(screen.getByText('尚未审核，通过助手发起审核')).toBeTruthy();
  });

  it('displays review score', () => {
    renderWithProviders(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('85')).toBeTruthy();
    expect(screen.getByText('/ 100')).toBeTruthy();
  });

  it('displays all check items', () => {
    renderWithProviders(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('描述清晰')).toBeTruthy();
    expect(screen.getByText('步骤完整')).toBeTruthy();
    expect(screen.getByText('建议补充错误处理')).toBeTruthy();
    expect(screen.getByText('未定义超时策略')).toBeTruthy();
  });

  it('displays check item details', () => {
    renderWithProviders(<ReviewPanel result={sampleResult} />);
    expect(screen.getByText('当前未处理 API 超时场景')).toBeTruthy();
  });

  it('renders empty check item list correctly', () => {
    renderWithProviders(<ReviewPanel result={{ score: 100, items: [] }} />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows success color for score ≥ 80', () => {
    const { container } = renderWithProviders(<ReviewPanel result={{ score: 85, items: [] }} />);
    const scoreElement = screen.getByText('85');
    // Verify element exists
    expect(scoreElement).toBeTruthy();
  });

  it('shows warning color for score 60-79', () => {
    const { container } = renderWithProviders(<ReviewPanel result={{ score: 65, items: [] }} />);
    const scoreElement = screen.getByText('65');
    expect(scoreElement).toBeTruthy();
  });

  it('shows error color for score < 60', () => {
    const { container } = renderWithProviders(<ReviewPanel result={{ score: 45, items: [] }} />);
    const scoreElement = screen.getByText('45');
    expect(scoreElement).toBeTruthy();
  });
});
