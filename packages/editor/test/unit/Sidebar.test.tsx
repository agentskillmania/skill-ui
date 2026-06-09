/** @jsxImportSource @emotion/react */
import { vi } from 'vitest';
import { describe, it, expect } from 'vitest';

// Mock chat components — expose callbacks via testable buttons
vi.mock('@agentskillmania/skill-ui-chat', () => ({
  MessageList: () => <div data-testid="message-list" />,
  ChatInput: ({
    placeholder,
    onSubmit,
    onCancel,
  }: {
    placeholder: string;
    onSubmit?: (msg: string) => void;
    onCancel?: () => void;
  }) => (
    <div>
      <span>{placeholder}</span>
      <button data-testid="chat-submit" onClick={() => onSubmit?.('hello')}>
        submit
      </button>
      <button data-testid="chat-cancel" onClick={() => onCancel?.()}>
        cancel
      </button>
    </div>
  ),
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { Sidebar } from '../../src/sidebar/Sidebar.js';
import type { ProjectFile, ReviewItem, TestCase } from '../../src/types.js';

const sampleFiles: ProjectFile[] = [
  { path: 'AGENT.md', content: '# Agent' },
  { path: 'package.json', content: '{}' },
];

const sampleReviewItems: ReviewItem[] = [
  {
    id: 'r1',
    source: 'lint',
    severity: 'error',
    message: 'Invalid config',
    timestamp: Date.now(),
  },
];

const sampleTestCases: TestCase[] = [
  { id: 'tc1', name: 'basic-chat', status: 'passed', duration: 1200 },
];

describe('Sidebar', () => {
  // ─── Panel visibility ───

  it('only shows ActivityBar when panel is collapsed', () => {
    renderWithProviders(
      <Sidebar
        activePanel={null}
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByTitle('文件')).toBeTruthy();
    expect(screen.queryByText('AGENT.md')).toBeNull();
  });

  it('expanding file panel shows FileTree', () => {
    renderWithProviders(
      <Sidebar
        activePanel="files"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('AGENT.md')).toBeTruthy();
  });

  it('expanding review panel shows ReviewPanel', () => {
    renderWithProviders(
      <Sidebar
        activePanel="review"
        files={sampleFiles}
        reviewItems={sampleReviewItems}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('Invalid config')).toBeTruthy();
  });

  it('expanding test panel shows TestCase', () => {
    renderWithProviders(
      <Sidebar
        activePanel="test"
        files={sampleFiles}
        testCases={sampleTestCases}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('basic-chat')).toBeTruthy();
  });

  it('expanding copilot panel shows CopilotPanel', () => {
    renderWithProviders(
      <Sidebar
        activePanel="copilot"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('向 Copilot 提问...')).toBeTruthy();
  });

  // ─── ActivityBar interaction ───

  it('clicking ActivityBar icon triggers panel switch', () => {
    const onPanel = vi.fn();
    renderWithProviders(
      <Sidebar
        activePanel={null}
        files={sampleFiles}
        onPanelChange={onPanel}
        onFileSelect={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('文件'));
    expect(onPanel).toHaveBeenCalledWith('files');
  });

  // ─── Copilot callback passthrough ───

  it('clicking chat submit triggers onCopilotSend', () => {
    const onCopilotSend = vi.fn();
    renderWithProviders(
      <Sidebar
        activePanel="copilot"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
        onCopilotSend={onCopilotSend}
      />
    );
    const submitBtn = screen.getByTestId('chat-submit');
    fireEvent.click(submitBtn);
    expect(onCopilotSend).toHaveBeenCalledWith('hello');
  });

  it('clicking chat cancel triggers onCopilotStop', () => {
    const onCopilotStop = vi.fn();
    renderWithProviders(
      <Sidebar
        activePanel="copilot"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
        onCopilotStop={onCopilotStop}
      />
    );
    const cancelBtn = screen.getByTestId('chat-cancel');
    fireEvent.click(cancelBtn);
    expect(onCopilotStop).toHaveBeenCalled();
  });

  // ─── Test callback passthrough ───

  it('clicking Run All in test panel triggers onRunAllTests', () => {
    const onRunAllTests = vi.fn();
    renderWithProviders(
      <Sidebar
        activePanel="test"
        files={sampleFiles}
        testCases={sampleTestCases}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
        onRunAllTests={onRunAllTests}
      />
    );
    // The TestCase component renders the "全部运行" button via i18n
    fireEvent.click(screen.getByText('全部运行'));
    expect(onRunAllTests).toHaveBeenCalledOnce();
  });

  it('clicking individual test run triggers onRunTest with correct id', () => {
    const onRunTest = vi.fn();
    const singleCase: TestCase[] = [{ id: 'tc-x', name: 'my-test', status: 'idle' }];
    renderWithProviders(
      <Sidebar
        activePanel="test"
        files={sampleFiles}
        testCases={singleCase}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
        onRunTest={onRunTest}
      />
    );
    // Layout: [0] "全部运行" (TestCase header), [1] play button (TestCaseRow),
    //         [2..] ActivityBar icons. The per-case play button is at index 1.
    const buttons = screen.getAllByRole('button');
    // "全部运行" has text content; the play button right after it has empty text
    const playButton = buttons[1];
    expect(playButton.textContent).toBe('');
    fireEvent.click(playButton);
    expect(onRunTest).toHaveBeenCalledWith('tc-x');
  });
});
