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
  it('渲染输入框', () => {
    render(
      <ChatWrapper>
        <ChatInput />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('使用自定义 placeholder', () => {
    render(
      <ChatWrapper>
        <ChatInput placeholder="说点什么..." />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('说点什么...')).toBeInTheDocument();
  });

  it('渲染 prefix 和 suffix', () => {
    render(
      <ChatWrapper>
        <ChatInput prefix={<span>前缀</span>} suffix={<span>后缀</span>} />
      </ChatWrapper>
    );
    expect(screen.getByText('前缀')).toBeInTheDocument();
    expect(screen.getByText('后缀')).toBeInTheDocument();
  });

  it('loading 状态显示停止按钮', () => {
    render(
      <ChatWrapper>
        <ChatInput loading onCancel={() => {}} />
      </ChatWrapper>
    );
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disabled 状态', () => {
    render(
      <ChatWrapper>
        <ChatInput disabled />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息...');
    expect(textarea).toBeDisabled();
  });

  it('传入受控 value', () => {
    render(
      <ChatWrapper>
        <ChatInput value="测试文本" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByDisplayValue('测试文本')).toBeInTheDocument();
  });

  it('提交空白文本时不触发 onSubmit', () => {
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

  it('提交纯空格文本时不触发 onSubmit', () => {
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

  it('提交有效文本时触发 onSubmit 并 trim', () => {
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

  it('传入 commands 和 onCommand 时渲染自动补全包裹', () => {
    const onCommand = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={mockCommands} onCommand={onCommand} />
      </ChatWrapper>
    );
    // 输入框应该被 CommandAutocomplete 包裹
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('无 commands 时直接渲染 senderElement', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('空 commands 列表直接渲染 senderElement', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={[]} onCommand={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });
});
