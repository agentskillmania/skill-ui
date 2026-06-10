/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { TestCase } from '../../src/panels/test-case/TestCase.js';
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
  it('shows empty state when cases is undefined', () => {
    renderWithProviders(<TestCase />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  it('shows empty state with empty array', () => {
    renderWithProviders(<TestCase cases={[]} />);
    expect(screen.getByText('暂无测试用例')).toBeTruthy();
  });

  it('displays all test case names', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('basic-chat')).toBeTruthy();
    expect(screen.getByText('tool-calling')).toBeTruthy();
    expect(screen.getByText('multi-turn')).toBeTruthy();
    expect(screen.getByText('skill-loading')).toBeTruthy();
  });

  it('displays run all button', () => {
    const onRunAll = vi.fn();
    renderWithProviders(<TestCase cases={sampleCases} onRunAll={onRunAll} />);
    expect(screen.getByText('全部运行')).toBeTruthy();
  });

  it('formats duration >= 1000ms as seconds', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('1.2s')).toBeTruthy();
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
    expect(screen.queryByText('0ms')).toBeNull();
  });

  it('clicking Run All triggers onRunAll callback', () => {
    const onRunAll = vi.fn();
    renderWithProviders(<TestCase cases={sampleCases} onRunAll={onRunAll} />);
    fireEvent.click(screen.getByText('全部运行'));
    expect(onRunAll).toHaveBeenCalledOnce();
  });

  it('clicking play on a single case triggers onRunCase with case id', () => {
    const onRunCase = vi.fn();
    const singleCase: TestCaseType[] = [{ id: 'my-test', name: 'my-test', status: 'idle' }];
    renderWithProviders(<TestCase cases={singleCase} onRunCase={onRunCase} />);
    const buttons = screen.getAllByRole('button');
    // SectionHeader "全部运行" button + per-case play button
    const playButton = buttons[buttons.length - 1];
    fireEvent.click(playButton);
    expect(onRunCase).toHaveBeenCalledWith('my-test');
  });

  it('play button is disabled for running case', () => {
    const onRunCase = vi.fn();
    const runningCase: TestCaseType[] = [
      { id: 'running1', name: 'in-progress', status: 'running' },
    ];
    renderWithProviders(<TestCase cases={runningCase} onRunCase={onRunCase} />);
    const buttons = screen.getAllByRole('button');
    const playButton = buttons[buttons.length - 1];
    expect(playButton).toBeDisabled();
    fireEvent.click(playButton);
    expect(onRunCase).not.toHaveBeenCalled();
  });

  it('shows error detail for failed case by default (auto-expanded)', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    expect(screen.getByText('Agent did not call web_search')).toBeTruthy();
  });

  it('collapses error detail when clicking the row', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    // ExpandableRow wraps the summary in a clickable div with data-testid="expandable-summary"
    // Clicking the test case name triggers toggle via the ExpandableRow wrapper
    fireEvent.click(screen.getByText('multi-turn'));
    expect(screen.queryByText('Agent did not call web_search')).toBeNull();
  });

  it('re-expands error detail on second click', () => {
    renderWithProviders(<TestCase cases={sampleCases} />);
    fireEvent.click(screen.getByText('multi-turn'));
    expect(screen.queryByText('Agent did not call web_search')).toBeNull();
    fireEvent.click(screen.getByText('multi-turn'));
    expect(screen.getByText('Agent did not call web_search')).toBeTruthy();
  });

  it('does not show expand for cases without error', () => {
    const noErrorCases: TestCaseType[] = [
      { id: 'pass1', name: 'passing-test', status: 'passed', duration: 100 },
    ];
    renderWithProviders(<TestCase cases={noErrorCases} />);
    // Passed case has no error, clicking should not crash
    fireEvent.click(screen.getByText('passing-test'));
    expect(screen.getByText('passing-test')).toBeTruthy();
  });
});
