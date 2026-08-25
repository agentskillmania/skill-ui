import { describe, it, expect, vi } from 'vitest';
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
  it('renders all messages', () => {
    render(
      <ChatWrapper>
        <MessageList messages={messages} />
      </ChatWrapper>
    );
    expect(screen.getByText('第一条')).toBeInTheDocument();
    expect(screen.getByText('第二条')).toBeInTheDocument();
    expect(screen.getByText('系统消息')).toBeInTheDocument();
  });

  it('renders container with no children for empty list', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageList messages={[]} />
      </ChatWrapper>
    );
    // The scrollable div should exist but have no MessageItem children
    const scrollContainer = container.firstElementChild as HTMLElement;
    expect(scrollContainer).toBeTruthy();
    expect(scrollContainer.children.length).toBe(0);
  });

  it('long list renders normally', () => {
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

  describe('message footer meta', () => {
    it('renders messageMeta in the footer row, alongside the actions', () => {
      const withMeta: Message[] = [
        {
          id: 'u1',
          role: 'user',
          content: '带时间的提问',
          status: 'completed',
          createdAt: 1756089600000,
        },
        {
          id: 'a1',
          role: 'assistant',
          content: '带用量的回答',
          status: 'completed',
          usage: {
            inputTokens: 800,
            outputTokens: 150,
            cacheReadTokens: 40,
            cacheWriteTokens: 0,
            durationMs: 2000,
          },
        },
      ];
      const { container } = render(
        <ChatWrapper>
          <MessageList
            messages={withMeta}
            onCopyMessage={vi.fn()}
            messageMeta={(m) => (
              <span>
                {m.createdAt ? 'meta-time' : ''}
                {m.usage ? ' meta-usage' : ''}
              </span>
            )}
          />
        </ChatWrapper>
      );
      expect(screen.getByText(/meta-time/)).toBeInTheDocument();
      expect(screen.getByText(/meta-usage/)).toBeInTheDocument();
      // Meta and the actions live in the same footer row (both are children
      // of the .msg-footer element).
      const footers = container.querySelectorAll('.msg-footer');
      expect(footers.length).toBe(2);
      expect(footers[0].textContent).toContain('meta-time');
      expect(footers[1].textContent).toContain('meta-usage');
      expect(footers[1].querySelector('.msg-actions')).toBeTruthy();
    });

    it('renders no footer row when neither meta nor any action is wired', () => {
      const { container } = render(
        <ChatWrapper>
          <MessageList messages={messages} />
        </ChatWrapper>
      );
      expect(container.querySelector('.msg-footer')).toBeNull();
      expect(container.querySelector('.msg-actions')).toBeNull();
    });
  });

  describe('per-position action buttons', () => {
    const conversation: Message[] = [
      { id: 'u1', role: 'user', content: '问题一', status: 'completed' },
      { id: 'a1', role: 'assistant', content: '回答一', status: 'completed' },
      { id: 'u2', role: 'user', content: '问题二', status: 'completed' },
      { id: 'a2', role: 'assistant', content: '回答二', status: 'completed' },
    ];

    function allCallbacks() {
      return {
        onCopyMessage: vi.fn(),
        onEditMessage: vi.fn(),
        onRegenerateMessage: vi.fn(),
        onRollbackMessage: vi.fn(),
        onForkMessage: vi.fn(),
      };
    }

    /** Buttons inside the hover action bar of the message with given content */
    function actionButtons(container: HTMLElement, content: string) {
      let node = screen.getByText(content) as HTMLElement | null;
      while (node && !node.querySelector('.msg-actions')) {
        node = node.parentElement;
      }
      expect(node).toBeTruthy();
      return node!.querySelectorAll('.msg-actions button');
    }

    it('wires edit to the last user message only, regenerate to the last completed assistant only', () => {
      const { container } = render(
        <ChatWrapper>
          <MessageList messages={conversation} {...allCallbacks()} />
        </ChatWrapper>
      );
      // u1: copy only (non-last user)
      expect(actionButtons(container, '问题一').length).toBe(1);
      // u2: copy + edit
      expect(actionButtons(container, '问题二').length).toBe(2);
      // a1: copy + rollback + fork
      expect(actionButtons(container, '回答一').length).toBe(3);
      // a2: copy + regenerate
      expect(actionButtons(container, '回答二').length).toBe(2);
    });

    it('skips an error tail when finding the last completed assistant (regenerate moves up)', () => {
      const withErrorTail: Message[] = [
        ...conversation.slice(0, 2), // u1, a1 completed
        { id: 'u3', role: 'user', content: '问题三', status: 'completed' },
        { id: 'a3', role: 'assistant', content: '出错了', status: 'error' },
      ];
      const { container } = render(
        <ChatWrapper>
          <MessageList messages={withErrorTail} {...allCallbacks()} />
        </ChatWrapper>
      );
      // a1 is now the last completed assistant → copy + regenerate
      expect(actionButtons(container, '回答一').length).toBe(2);
    });

    it('hides every action bar while streaming (hideActions)', () => {
      const { container } = render(
        <ChatWrapper>
          <MessageList messages={conversation} hideActions {...allCallbacks()} />
        </ChatWrapper>
      );
      expect(container.querySelectorAll('.msg-actions button').length).toBe(0);
    });

    it('renders no action buttons when no callback is wired', () => {
      const { container } = render(
        <ChatWrapper>
          <MessageList messages={conversation} />
        </ChatWrapper>
      );
      expect(container.querySelectorAll('.msg-actions button').length).toBe(0);
    });
  });
});
