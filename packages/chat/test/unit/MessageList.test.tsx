import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MessageList } from '../../src/MessageList/index.js';
import type { Message } from '../../src/types.js';

const messages: Message[] = [
  { id: '1', role: 'user', content: '第一条', status: 'completed' },
  { id: '2', role: 'assistant', content: '第二条', status: 'completed' },
  { id: '3', role: 'system', content: '系统消息', status: 'completed' },
];

describe('MessageList', () => {
  it('渲染所有消息', () => {
    render(
      <ChatWrapper>
        <MessageList messages={messages} />
      </ChatWrapper>
    );
    expect(screen.getByText('第一条')).toBeInTheDocument();
    expect(screen.getByText('第二条')).toBeInTheDocument();
    expect(screen.getByText('系统消息')).toBeInTheDocument();
  });

  it('空列表不崩溃', () => {
    render(
      <ChatWrapper>
        <MessageList messages={[]} />
      </ChatWrapper>
    );
    // 不崩溃即可
  });

  it('长列表正常渲染', () => {
    const long: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `m${i}`,
      role: 'user' as const,
      content: `消息 ${i}`,
      status: 'completed' as const,
    }));
    render(
      <ChatWrapper>
        <MessageList messages={long} />
      </ChatWrapper>
    );
    expect(screen.getByText('消息 0')).toBeInTheDocument();
    expect(screen.getByText('消息 49')).toBeInTheDocument();
  });
});
