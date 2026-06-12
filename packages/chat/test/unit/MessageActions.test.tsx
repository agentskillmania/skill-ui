/**
 * MessageActions component tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MessageActions } from '../../src/messages/MessageActions.js';
import type { Message } from '../../src/types.js';

const userMsg: Message = { id: 'u1', role: 'user', content: 'hello', status: 'completed' };
const assistantMsg: Message = {
  id: 'a1',
  role: 'assistant',
  content: 'world',
  status: 'completed',
};
const streamingMsg: Message = {
  id: 'a2',
  role: 'assistant',
  content: '...',
  status: 'streaming',
};
const systemMsg: Message = { id: 's1', role: 'system', content: 'notice', status: 'completed' };
const toolMsg: Message = { id: 't1', role: 'tool', content: 'result', status: 'completed' };

describe('MessageActions', () => {
  it('returns null for system messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={systemMsg} />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('returns null for tool messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={toolMsg} />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('renders 1 action button (copy) for basic assistant messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onCopy when copy button clicked', () => {
    const onCopy = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onCopy={onCopy} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
    expect(onCopy).toHaveBeenCalledWith(assistantMsg);
  });

  it('renders resend button for user messages (2 buttons)', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    // user messages have copy + resend
    expect(buttons.length).toBe(2);
  });

  it('calls onResend when resend button clicked on user message', () => {
    const onResend = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} onResend={onResend} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    // Second button is resend
    fireEvent.click(buttons[1]);
    expect(onResend).toHaveBeenCalledWith(userMsg);
  });

  it('renders 4 action buttons for completed assistant messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    // completed assistant has copy + regenerate + rollback + fork
    expect(buttons.length).toBe(4);
  });

  it('does not render regenerate/rollback/fork for streaming assistant messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={streamingMsg} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    // streaming assistant only has copy
    expect(buttons.length).toBe(1);
  });

  it('calls onRegenerate when regenerate button clicked', () => {
    const onRegenerate = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onRegenerate={onRegenerate} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[1]); // second button is regenerate
    expect(onRegenerate).toHaveBeenCalledWith(assistantMsg);
  });

  it('calls onRollback when rollback button clicked', () => {
    const onRollback = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onRollback={onRollback} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]); // third button is rollback
    expect(onRollback).toHaveBeenCalledWith(assistantMsg);
  });

  it('calls onFork when fork button clicked', () => {
    const onFork = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onFork={onFork} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[3]); // fourth button is fork
    expect(onFork).toHaveBeenCalledWith(assistantMsg);
  });

  it('renders with ghost variant', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} variant="ghost" />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);
  });

  it('does not crash when callbacks are not provided', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} />
      </ChatWrapper>
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    // Click without onCopy/onResend should not throw
    expect(() => {
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);
    }).not.toThrow();
  });
});
