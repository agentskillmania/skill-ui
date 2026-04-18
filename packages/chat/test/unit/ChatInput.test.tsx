import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { ChatInput } from '../../src/ChatInput/index.js';

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
    // Sender 的 submitDisabled 会在 value 为空时禁用提交
    // 所以即使触发 Enter 也不会调用 onSubmit
    const textarea = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('提交纯空格文本时不触发 onSubmit', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    // Sender 内部 submitDisabled 基于 !innerValue
    // value="   " 不是空字符串，所以 Sender 会触发 onSubmit，
    // 但 ChatInput 的 handleSubmit 中 trimmed 为空，不会调用 onSubmit
    render(
      <ChatWrapper>
        <ChatInput value="   " onSubmit={onSubmit} onChange={onChange} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    // ChatInput.handleSubmit 检查 trimmed，纯空格 trimmed 为空，不调用 onSubmit
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
    // Sender 会将 value 传给 ChatInput 的 handleSubmit
    // handleSubmit 中 trimmed = "hello"，然后调用 onSubmit("hello")
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });
});
