import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { ChatInput } from '../../src/ChatInput/index.js';
import type { ChatCommand } from '../../src/types.js';

const mockCommands: ChatCommand[] = [
  { id: '1', label: '搜索', command: 'search' },
  { id: '2', label: '帮助', command: 'help' },
];

describe('ChatInput', () => {
  it('renders input', () => {
    render(
      <ChatWrapper>
        <ChatInput />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(
      <ChatWrapper>
        <ChatInput placeholder="说点什么..." />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('说点什么...')).toBeInTheDocument();
  });

  it('renders prefix and suffix', () => {
    render(
      <ChatWrapper>
        <ChatInput prefix={<span>前缀</span>} suffix={<span>后缀</span>} />
      </ChatWrapper>
    );
    expect(screen.getByText('前缀')).toBeInTheDocument();
    expect(screen.getByText('后缀')).toBeInTheDocument();
  });

  it('loading status shows stop button', () => {
    render(
      <ChatWrapper>
        <ChatInput loading onCancel={() => {}} />
      </ChatWrapper>
    );
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disabled status', () => {
    render(
      <ChatWrapper>
        <ChatInput disabled />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    expect(textarea).toBeDisabled();
  });

  it('passes controlled value', () => {
    render(
      <ChatWrapper>
        <ChatInput value="测试文本" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByDisplayValue('测试文本')).toBeInTheDocument();
  });

  it('does not trigger onSubmit when submitting blank text', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="" onSubmit={onSubmit} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not trigger onSubmit when submitting whitespace-only text', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="   " onSubmit={onSubmit} onChange={onChange} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('triggers onSubmit and trims when submitting valid text', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="  hello  " onSubmit={onSubmit} onChange={onChange} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });

  it('renders autocomplete wrapper when commands and onCommand are passed', () => {
    const onCommand = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={mockCommands} onCommand={onCommand} />
      </ChatWrapper>
    );
    // input should be wrapped by CommandAutocomplete
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
  });

  it('selecting a command calls onCommand and clears input', async () => {
    const onCommand = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <ChatInput value="/se" onChange={onChange} commands={mockCommands} onCommand={onCommand} />
      </ChatWrapper>
    );
    // Wait for the autocomplete panel item to appear (portal renders after layout effect)
    const { waitFor } = await import('@testing-library/react');
    const menuItem = await waitFor(() => {
      const item = Array.from(document.querySelectorAll('[data-testid="cmd-item"]')).find((el) =>
        el.textContent?.includes('搜索')
      );
      expect(item).toBeDefined();
      return item!;
    });
    const userEvent = (await import('@testing-library/user-event')).default;
    await userEvent.click(menuItem);
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1', command: 'search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders senderElement directly without commands', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
  });

  it('renders senderElement directly with empty commands list', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={[]} onCommand={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
  });

  it('Shift+Enter does not trigger onSubmit', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="hello" onSubmit={onSubmit} onChange={() => {}} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('value and onChange are required for controlled mode', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput value="initial" onChange={onChange} />
      </ChatWrapper>
    );
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

    // Re-render with new value simulates controlled update
    rerender(
      <ChatWrapper>
        <ChatInput value="updated" onChange={onChange} />
      </ChatWrapper>
    );
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  // ---- Toolbar (model / thinking / context / quick commands) ----

  it('does not render toolbar without commands or new props', () => {
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.queryByTestId('chat-input-toolbar')).toBeNull();
  });

  it('toolbar shows quick-command capsules and click triggers onCommand', () => {
    const onCommand = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} commands={mockCommands} onCommand={onCommand} />
      </ChatWrapper>
    );
    expect(screen.getByTestId('chat-input-toolbar')).toBeInTheDocument();
    const capsules = screen.getAllByTestId('quick-command');
    expect(capsules).toHaveLength(2);
    fireEvent.click(capsules[0]);
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('model selector shows selectedModel label and selecting calls onModelChange', async () => {
    const onModelChange = vi.fn();
    const { waitFor } = await import('@testing-library/react');
    render(
      <ChatWrapper>
        <ChatInput
          value=""
          onChange={() => {}}
          models={[
            {
              key: 'openai',
              label: 'OpenAI',
              models: [
                { id: 'gpt-4o', label: 'GPT-4o' },
                { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
              ],
            },
          ]}
          selectedModel={{ id: 'gpt-4o', label: 'GPT-4o' }}
          onModelChange={onModelChange}
        />
      </ChatWrapper>
    );
    const trigger = screen.getByTestId('model-selector');
    expect(trigger.textContent).toContain('GPT-4o');
    fireEvent.click(trigger);
    const item = await waitFor(() => {
      const el = Array.from(document.querySelectorAll('.ant-dropdown-menu-item')).find((e) =>
        e.textContent?.includes('mini')
      );
      expect(el).toBeDefined();
      return el!;
    });
    fireEvent.click(item);
    expect(onModelChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'gpt-4o-mini' }));
  });

  it('thinking toggle cycles null → true → false → null', () => {
    const onThinkingChange = vi.fn();
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput
          value=""
          onChange={() => {}}
          thinking={null}
          onThinkingChange={onThinkingChange}
        />
      </ChatWrapper>
    );

    let toggle = screen.getByTestId('thinking-toggle');
    fireEvent.click(toggle);
    expect(onThinkingChange).toHaveBeenLastCalledWith(true);

    rerender(
      <ChatWrapper>
        <ChatInput
          value=""
          onChange={() => {}}
          thinking={true}
          onThinkingChange={onThinkingChange}
        />
      </ChatWrapper>
    );
    toggle = screen.getByTestId('thinking-toggle');
    fireEvent.click(toggle);
    expect(onThinkingChange).toHaveBeenLastCalledWith(false);

    rerender(
      <ChatWrapper>
        <ChatInput
          value=""
          onChange={() => {}}
          thinking={false}
          onThinkingChange={onThinkingChange}
        />
      </ChatWrapper>
    );
    toggle = screen.getByTestId('thinking-toggle');
    fireEvent.click(toggle);
    expect(onThinkingChange).toHaveBeenLastCalledWith(null);
  });

  it('context usage renders used / total', () => {
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} contextUsage={{ used: 12000, total: 200000 }} />
      </ChatWrapper>
    );
    const usage = screen.getByTestId('context-usage');
    expect(usage.textContent).toContain('12k');
    expect(usage.textContent).toContain('200k');
  });
});
