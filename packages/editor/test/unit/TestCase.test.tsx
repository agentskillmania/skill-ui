/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { TestCase } from '../../src/components/TestCase/TestCase.js';
import type { TestCase as TestCaseType } from '../../src/types.js';

const sampleCases: TestCaseType[] = [
  { id: 'tc1', name: 'basic-chat', status: 'passed', duration: 1200 },
  { id: 'tc2', name: 'tool-calling', status: 'running' },
  {
    id: 'tc3',
    name: 'multi-turn',
    status: 'failed',
    duration: 3500,
    error: 'Agent did not call web_search',
  },
  { id: 'tc4', name: 'skill-loading', status: 'idle' },
];

describe('TestCase', () => {
  // ─── Empty state ───

  it('shows empty state when cases is undefined', () => {
    renderWithProviders(<TestCase />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  it('shows empty state with empty array', () => {
    renderWithProviders(<TestCase cases={[]} />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  // ─── Rendering ───

  it('displays all test case names', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('basic-chat')).toBeTruthy();
    expect(screen.getByText('tool-calling')).toBeTruthy();
    expect(screen.getByText('multi-turn')).toBeTruthy();
    expect(screen.getByText('skill-loading')).toBeTruthy();
  });

  it('displays header title', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('测试用例')).toBeTruthy();
  });

  // ─── Duration formatting ───

  it('formats duration >= 1000ms as seconds', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    // tc1 has duration 1200 -> "1.2s"
    expect(screen.getByText('1.2s')).toBeTruthy();
    // tc3 has duration 3500 -> "3.5s"
    expect(screen.getByText('3.5s')).toBeTruthy();
  });

  it('formats duration < 1000ms as milliseconds', () => {
    const cases: TestCaseType[] = [
      { id: 'fast', name: 'fast-test', status: 'passed', duration: 500 },
    ];
    renderWithProviders(<TestCase cases={cases} />);
    expect(screen.getByText('500ms')).toBeTruthy();
  });

  it('does not show duration for cases without duration', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    // tc2 (running) and tc4 (idle) have no duration field
    expect(screen.queryByText('0ms')).toBeNull();
  });

  // ─── Run All ───

  it('clicking Run All triggers onRunAll callback', () => {
    const onRunAll = vi.fn();
    renderWithProviders(<TestCase cases={sampleCases} onRunAll={onRunAll} />);
    fireEvent.click(screen.getByText('全部运行'));
    expect(onRunAll).toHaveBeenCalledOnce();
  });

  // ─── Individual run (onRunCase) ───

  it('clicking play on a single case triggers onRunCase with case id', () => {
    const onRunCase = vi.fn();
    const singleCase: TestCaseType[] = [{ id: 'my-test', name: 'my-test', status: 'idle' }];
    renderWithProviders(<TestCase cases={singleCase} onRunCase={onRunCase} />);
    // There should be 2 buttons: "全部运行" header + one play button per row
    const buttons = screen.getAllByRole('button');
    // First is "全部运行", last is the play button for the case
    const playButton = buttons[buttons.length - 1];
    fireEvent.click(playButton);
    expect(onRunCase).toHaveBeenCalledWith('my-test');
  });

  // ─── Running state disabled ───

  it('play button is disabled for running case', () => {
    const onRunCase = vi.fn();
    const runningCase: TestCaseType[] = [
      { id: 'running1', name: 'in-progress', status: 'running' },
    ];
    renderWithProviders(<TestCase cases={runningCase} onRunCase={onRunCase} />);
    const buttons = screen.getAllByRole('button');
    const playButton = buttons[buttons.length - 1];
    expect(playButton).toBeDisabled();
    // Clicking disabled button should not trigger callback
    fireEvent.click(playButton);
    expect(onRunCase).not.toHaveBeenCalled();
  });

  // ─── Error expand/collapse ───

  it('shows error detail for failed case by default (auto-expanded)', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('Agent did not call web_search')).toBeTruthy();
  });

  it('shows collapse toggle for expanded failed case', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('▲')).toBeTruthy();
  });

  it('collapses error detail when clicking collapse toggle', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    fireEvent.click(screen.getByText('▲'));
    expect(screen.queryByText('Agent did not call web_search')).toBeNull();
    expect(screen.getByText('▼')).toBeTruthy();
  });

  it('re-expands error detail when clicking expand toggle', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    // Collapse
    fireEvent.click(screen.getByText('▲'));
    expect(screen.queryByText('Agent did not call web_search')).toBeNull();
    // Re-expand
    fireEvent.click(screen.getByText('▼'));
    expect(screen.getByText('Agent did not call web_search')).toBeTruthy();
    expect(screen.getByText('▲')).toBeTruthy();
  });

  it('does not show toggle for cases without error', () => {
    const noErrorCases: TestCaseType[] = [
      { id: 'pass1', name: 'passing-test', status: 'passed', duration: 100 },
    ];
    renderWithProviders(<TestCase cases={noErrorCases} />);
    expect(screen.queryByText('▲')).toBeNull();
    expect(screen.queryByText('▼')).toBeNull();
  });
});
