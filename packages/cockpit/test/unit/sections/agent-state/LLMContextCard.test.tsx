/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { LLMContextCard } from '../../../../src/sections/agent-state/LLMContextCard.js';

/** LLM data shape matching daemon's lastLLMRequest. */
type LLMSnapshot = { messages: unknown[]; tools?: unknown[] };

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create minimal valid LLM snapshot data. */
function createLLMContext(overrides: Partial<LLMSnapshot> = {}): LLMSnapshot {
  return {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ],
    tools: [{ name: 'read_file' }, { name: 'write_file' }],
    ...overrides,
  };
}

describe('LLMContextCard', () => {
  it('renders "No requests yet" when llm is null', () => {
    renderWithTheme(<LLMContextCard llm={null} />);
    expect(screen.getByText('暂无请求')).toBeInTheDocument();
  });

  it('renders "No requests yet" when llm is undefined', () => {
    renderWithTheme(<LLMContextCard />);
    expect(screen.getByText('暂无请求')).toBeInTheDocument();
  });

  it('renders message count', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext()} />);
    const twos = screen.getAllByText('2');
    expect(twos.length).toBe(2);
  });

  it('renders tool count', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext()} />);
    const toolEls = screen.getAllByText('2');
    expect(toolEls.length).toBeGreaterThanOrEqual(1);
  });

  it('renders zero tool count when tools array is empty', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext({ tools: [] })} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders zero tool count when tools is undefined', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext({ tools: undefined })} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders system prompt block when first message has string content', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext()} />);
    expect(screen.getByTestId('system-prompt-toggle')).toBeInTheDocument();
  });

  it('does not render system prompt block when first message has no content', () => {
    renderWithTheme(
      <LLMContextCard llm={createLLMContext({ messages: [{ role: 'user', content: null }] })} />,
    );
    expect(screen.queryByTestId('system-prompt-toggle')).not.toBeInTheDocument();
  });

  it('does not render system prompt block when messages is empty', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext({ messages: [] })} />);
    expect(screen.queryByTestId('system-prompt-toggle')).not.toBeInTheDocument();
  });

  it('does not render system prompt block when content is empty string', () => {
    renderWithTheme(
      <LLMContextCard llm={createLLMContext({ messages: [{ role: 'system', content: '' }] })} />,
    );
    expect(screen.queryByTestId('system-prompt-toggle')).not.toBeInTheDocument();
  });

  it('renders system prompt text directly, click to expand', () => {
    const prompt = 'You are a code reviewer.';
    renderWithTheme(
      <LLMContextCard
        llm={createLLMContext({ messages: [{ role: 'system', content: prompt }] })}
      />,
    );

    // Prompt visible immediately (truncated by default)
    const toggle = screen.getByTestId('system-prompt-toggle');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByText(prompt)).toBeInTheDocument();

    // Click to expand
    fireEvent.click(toggle);
    expect(screen.getByText(prompt)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(toggle);
    expect(screen.getByText(prompt)).toBeInTheDocument();
  });

  it('supports keyboard interaction on system prompt', () => {
    const prompt = 'System prompt text.';
    renderWithTheme(
      <LLMContextCard
        llm={createLLMContext({ messages: [{ role: 'system', content: prompt }] })}
      />,
    );

    const toggle = screen.getByTestId('system-prompt-toggle');
    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(screen.getByText(prompt)).toBeInTheDocument();
  });

  it('collapses card body when toggle button is clicked', () => {
    renderWithTheme(<LLMContextCard llm={createLLMContext()} />);

    // Metrics visible
    const twos = screen.getAllByText('2');
    expect(twos.length).toBe(2);

    // Click collapse toggle
    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.queryByTestId('system-prompt-toggle')).not.toBeInTheDocument();
  });
});
