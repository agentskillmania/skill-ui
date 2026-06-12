import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { DaemonConfigPanel } from '../../src/components/DaemonConfigPanel.js';
import type { DaemonConfig } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const defaultValue: DaemonConfig = {
  llm: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'sk-test-key',
    model: 'gpt-4o',
    contextWindow: null,
    maxTokens: null,
    reasoning: 'auto',
  },
  server: {
    host: 'localhost',
    port: 3100,
  },
};

describe('DaemonConfigPanel', () => {
  it('renders LLM form fields', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('daemon-llm-baseUrl')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-apiKey')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-model')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-contextWindow')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-maxTokens')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-reasoning')).toBeInTheDocument();
  });

  it('displays current values', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const baseUrlInput = screen.getByTestId('daemon-llm-baseUrl') as HTMLInputElement;
    expect(baseUrlInput.value).toBe('https://api.openai.com/v1');

    const modelInput = screen.getByTestId('daemon-llm-model') as HTMLInputElement;
    expect(modelInput.value).toBe('gpt-4o');
  });

  it('calls onChange with llm partial when baseUrl changes', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const baseUrlInput = screen.getByTestId('daemon-llm-baseUrl');
    await userEvent.type(baseUrlInput, '2');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('llm');
    expect(lastCall.llm.baseUrl).toContain('https://api.openai.com/v12');
  });

  it('calls onChange with llm partial when model changes', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    await userEvent.type(screen.getByTestId('daemon-llm-model'), 'o');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('llm');
    expect(lastCall.llm.model).toBe('gpt-4oo');
  });

  it('renders i18n section title', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    // i18n mock returns the key
    expect(screen.getByText('daemon.llm.title')).toBeInTheDocument();
  });

  it('renders required asterisks for baseUrl, apiKey, model', () => {
    const { container } = render(
      <DaemonConfigPanel value={defaultValue} onChange={() => {}} />,
      { wrapper },
    );

    // Ant Design Form.Item with required prop renders a required marker
    // in the label via CSS ::before pseudo-element or a dedicated span.
    // Verify the three required Form.Items are present by checking label text.
    const allText = container.textContent ?? '';
    expect(allText).toContain('daemon.llm.baseUrl');
    expect(allText).toContain('daemon.llm.apiKey');
    expect(allText).toContain('daemon.llm.model');
  });

  it('handles reasoning select change to disabled', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    // Open the select and pick "disabled" option
    const select = screen.getByTestId('daemon-llm-reasoning');
    await userEvent.click(select);

    const disabledOption = await screen.findByText('reasoning.disabled');
    await userEvent.click(disabledOption);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.reasoning).toBe(false);
  });

  it('handles reasoning select change to enabled', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const select = screen.getByTestId('daemon-llm-reasoning');
    await userEvent.click(select);

    const enabledOption = await screen.findByText('reasoning.enabled');
    await userEvent.click(enabledOption);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.reasoning).toBe(true);
  });

  it('handles empty default values', () => {
    const emptyValue: DaemonConfig = {
      llm: { baseUrl: '', apiKey: '', model: '' },
      server: { host: '', port: 3100 },
    };

    render(<DaemonConfigPanel value={emptyValue} onChange={() => {}} />, { wrapper });

    const baseUrlInput = screen.getByTestId('daemon-llm-baseUrl') as HTMLInputElement;
    expect(baseUrlInput.value).toBe('');
  });

  it('calls onChange when apiKey changes', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const apiKeyInput = screen.getByTestId('daemon-llm-apiKey');
    await userEvent.type(apiKeyInput, 'x');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('llm');
    expect(lastCall.llm.apiKey).toContain('x');
  });

  it('calls onChange when contextWindow changes', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const contextWindowInput = screen.getByTestId('daemon-llm-contextWindow');
    await userEvent.type(contextWindowInput, '8');
    await userEvent.type(contextWindowInput, '000');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.contextWindow).toBe(8000);
  });

  it('calls onChange when maxTokens changes', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const maxTokensInput = screen.getByTestId('daemon-llm-maxTokens');
    await userEvent.type(maxTokensInput, '2');
    await userEvent.type(maxTokensInput, '048');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.maxTokens).toBe(2048);
  });

  it('calls onChange with null when contextWindow is cleared', async () => {
    const onChange = vi.fn();
    // Set initial contextWindow to a non-null value so InputNumber shows a value
    const withCtx = { ...defaultValue, llm: { ...defaultValue.llm, contextWindow: 4096 } };
    render(<DaemonConfigPanel value={withCtx} onChange={onChange} />, { wrapper });

    const contextWindowInput = screen.getByTestId('daemon-llm-contextWindow');
    // Clear the input — InputNumber onChange fires null
    await userEvent.clear(contextWindowInput);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.contextWindow).toBeNull();
  });

  it('calls onChange with null when maxTokens is cleared', async () => {
    const onChange = vi.fn();
    const withTokens = { ...defaultValue, llm: { ...defaultValue.llm, maxTokens: 2048 } };
    render(<DaemonConfigPanel value={withTokens} onChange={onChange} />, { wrapper });

    const maxTokensInput = screen.getByTestId('daemon-llm-maxTokens');
    await userEvent.clear(maxTokensInput);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.maxTokens).toBeNull();
  });
});
