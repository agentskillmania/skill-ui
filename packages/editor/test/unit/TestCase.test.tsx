/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { TestCase } from '../../src/components/RightPanel/TestCase/TestCase.js';
import type { SkillTestCase, TestResult } from '../../src/types.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const sampleCases: SkillTestCase[] = [
  { id: 'tc1', name: '基本问候', input: '你好' },
  { id: 'tc2', name: '搜索功能', input: '搜索 TypeScript' },
];

const sampleResults: TestResult[] = [
  { caseId: 'tc1', passed: true, duration: 120 },
  { caseId: 'tc2', passed: false, failureReason: '未调用搜索工具', duration: 350 },
];

describe('TestCase', () => {
  it('显示测试用例列表', () => {
    renderWithTheme(<TestCase testCases={sampleCases} />);
    expect(screen.getByText('基本问候')).toBeTruthy();
    expect(screen.getByText('搜索功能')).toBeTruthy();
  });

  it('无测试用例时显示空状态', () => {
    renderWithTheme(<TestCase testCases={[]} />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  it('不传 testCases 时显示空状态', () => {
    renderWithTheme(<TestCase />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  it('显示测试结果（通过/失败）', () => {
    renderWithTheme(<TestCase testCases={sampleCases} testResults={sampleResults} />);
    expect(screen.getByText('通过')).toBeTruthy();
    expect(screen.getByText('失败')).toBeTruthy();
  });

  it('点击"全部运行"触发回调', () => {
    const onRun = vi.fn();
    renderWithTheme(<TestCase testCases={sampleCases} onRunTests={onRun} />);
    fireEvent.click(screen.getByText('全部运行'));
    expect(onRun).toHaveBeenCalled();
  });

  it('显示头部标题', () => {
    renderWithTheme(<TestCase testCases={sampleCases} />);
    expect(screen.getByText('测试用例')).toBeTruthy();
  });
});
