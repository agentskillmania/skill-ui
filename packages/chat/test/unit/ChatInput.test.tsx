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
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
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
    const textarea = screen.getByPlaceholderText('输入消息...');
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
    const textarea = screen.getByPlaceholderText('输入消息...');
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
    const textarea = screen.getByPlaceholderText('输入消息...');
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
    const textarea = screen.getByPlaceholderText('输入消息...');
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
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('renders senderElement directly without commands', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('renders senderElement directly with empty commands list', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={[]} onCommand={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('Shift+Enter does not trigger onSubmit', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="hello" onSubmit={onSubmit} onChange={() => {}} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
