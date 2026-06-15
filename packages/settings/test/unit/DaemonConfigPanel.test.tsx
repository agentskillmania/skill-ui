import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { DaemonConfigPanel } from '../../src/components/DaemonConfigPanel.js';
import type { DaemonConfig } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const defaultValue: DaemonConfig = {
  llm: {
    providers: [
      {
        name: 'openai',
        apiKey: 'sk-test-key',
        baseUrl: 'https://api.openai.com/v1',
        maxConcurrency: 4,
        models: [
          {
            modelId: 'gpt-4o',
            contextWindow: null,
            maxTokens: null,
            reasoning: null,
          },
        ],
      },
    ],
  },
  server: {
    host: 'localhost',
    port: 3100,
  },
};

describe('DaemonConfigPanel', () => {
  it('renders provider and model form fields', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('daemon-llm-provider-0-name')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-apiKey')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-baseUrl')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-maxConcurrency')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-model-0-modelId')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-model-0-contextWindow')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-model-0-maxTokens')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-model-0-reasoning')).toBeInTheDocument();
  });

  it('displays current provider and model values', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const nameInput = screen.getByTestId('daemon-llm-provider-0-name') as HTMLInputElement;
    expect(nameInput.value).toBe('openai');

    const modelInput = screen.getByTestId(
      'daemon-llm-provider-0-model-0-modelId'
    ) as HTMLInputElement;
    expect(modelInput.value).toBe('gpt-4o');
  });

  it('calls onChange when provider name changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const nameInput = screen.getByTestId('daemon-llm-provider-0-name');
    fireEvent.change(nameInput, { target: { value: 'anthropic' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('llm');
    expect(lastCall.llm.providers[0].name).toBe('anthropic');
  });

  it('calls onChange when apiKey changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const apiKeyInput = screen.getByTestId('daemon-llm-provider-0-apiKey');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-new-key' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].apiKey).toBe('sk-new-key');
  });

  it('calls onChange when baseUrl changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const baseUrlInput = screen.getByTestId('daemon-llm-provider-0-baseUrl');
    fireEvent.change(baseUrlInput, { target: { value: 'https://api.anthropic.com/v1' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].baseUrl).toBe('https://api.anthropic.com/v1');
  });

  it('calls onChange when maxConcurrency changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const maxConcurrencyInput = screen.getByTestId('daemon-llm-provider-0-maxConcurrency');
    fireEvent.change(maxConcurrencyInput, { target: { value: '8' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].maxConcurrency).toBe(8);
  });

  it('calls onChange when modelId changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const modelIdInput = screen.getByTestId('daemon-llm-provider-0-model-0-modelId');
    fireEvent.change(modelIdInput, { target: { value: 'claude-3' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models[0].modelId).toBe('claude-3');
  });

  it('calls onChange when contextWindow changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const contextWindowInput = screen.getByTestId('daemon-llm-provider-0-model-0-contextWindow');
    fireEvent.change(contextWindowInput, { target: { value: '8000' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models[0].contextWindow).toBe(8000);
  });

  it('calls onChange when maxTokens changes', () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const maxTokensInput = screen.getByTestId('daemon-llm-provider-0-model-0-maxTokens');
    fireEvent.change(maxTokensInput, { target: { value: '2048' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models[0].maxTokens).toBe(2048);
  });

  it('handles reasoning select change to disabled', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const select = screen.getByTestId('daemon-llm-provider-0-model-0-reasoning');
    await userEvent.click(select);

    const disabledOption = await screen.findByText('reasoning.disabled');
    await userEvent.click(disabledOption);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models[0].reasoning).toBe(false);
  });

  it('handles reasoning select change to enabled', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const select = screen.getByTestId('daemon-llm-provider-0-model-0-reasoning');
    await userEvent.click(select);

    const enabledOption = await screen.findByText('reasoning.enabled');
    await userEvent.click(enabledOption);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models[0].reasoning).toBe(true);
  });

  it('calls onChange when adding a provider', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const addButton = screen.getByTestId('daemon-llm-add-provider');
    await userEvent.click(addButton);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers).toHaveLength(2);
    expect(lastCall.llm.providers[1].name).toBe('');
  });

  it('calls onChange when removing a provider', async () => {
    const multiProviderValue: DaemonConfig = {
      ...defaultValue,
      llm: {
        providers: [
          ...defaultValue.llm.providers,
          { name: 'anthropic', apiKey: 'sk-ant', models: [{ modelId: 'claude-3' }] },
        ],
      },
    };

    const onChange = vi.fn();
    render(<DaemonConfigPanel value={multiProviderValue} onChange={onChange} />, { wrapper });

    const removeButton = screen.getByTestId('daemon-llm-remove-provider-1');
    await userEvent.click(removeButton);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers).toHaveLength(1);
    expect(lastCall.llm.providers[0].name).toBe('openai');
  });

  it('calls onChange when adding a model', async () => {
    const onChange = vi.fn();
    render(<DaemonConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const addButton = screen.getByTestId('daemon-llm-provider-0-add-model');
    await userEvent.click(addButton);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models).toHaveLength(2);
    expect(lastCall.llm.providers[0].models[1].modelId).toBe('');
  });

  it('calls onChange when removing a model', async () => {
    const multiModelValue: DaemonConfig = {
      ...defaultValue,
      llm: {
        providers: [
          {
            ...defaultValue.llm.providers[0],
            models: [...defaultValue.llm.providers[0].models, { modelId: 'gpt-4o-mini' }],
          },
        ],
      },
    };

    const onChange = vi.fn();
    render(<DaemonConfigPanel value={multiModelValue} onChange={onChange} />, { wrapper });

    const removeButton = screen.getByTestId('daemon-llm-provider-0-remove-model-1');
    await userEvent.click(removeButton);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.llm.providers[0].models).toHaveLength(1);
    expect(lastCall.llm.providers[0].models[0].modelId).toBe('gpt-4o');
  });

  it('renders i18n section title', () => {
    render(<DaemonConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByText('daemon.llm.title')).toBeInTheDocument();
  });

  it('renders an empty provider when no providers are present', () => {
    const emptyValue: DaemonConfig = {
      llm: { providers: [] },
      server: { host: '', port: 3100 },
    };

    render(<DaemonConfigPanel value={emptyValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('daemon-llm-provider-0-name')).toBeInTheDocument();
    expect(screen.getByTestId('daemon-llm-provider-0-model-0-modelId')).toBeInTheDocument();
  });
});
