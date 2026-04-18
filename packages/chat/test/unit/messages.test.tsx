import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MessageItem } from '../../src/messages/MessageItem.js';
import { UserMessage } from '../../src/messages/UserMessage.js';
import { AssistantMessage } from '../../src/messages/AssistantMessage.js';
import { SystemMessage } from '../../src/messages/SystemMessage.js';
import { MessageWrapper } from '../../src/messages/MessageWrapper.js';
import type { Message } from '../../src/types.js';

const userMsg: Message = { id: '1', role: 'user', content: 'Hello', status: 'completed' };
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hi there',
  status: 'completed',
};
const systemMsg: Message = {
  id: '3',
  role: 'system',
  content: 'System notice',
  status: 'completed',
};

describe('UserMessage', () => {
  it('渲染用户消息内容', () => {
    render(
      <ChatWrapper>
        <UserMessage message={userMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  it('渲染助手消息内容', () => {
    render(
      <ChatWrapper>
        <AssistantMessage message={assistantMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('渲染带 blocks 的消息', () => {
    const msg: Message = {
      ...assistantMsg,
      blocks: [{ id: 'b1', type: 'thinking', status: 'completed', content: '思考中...' }],
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expect(screen.getByText('思考中...')).toBeInTheDocument();
  });
});

describe('SystemMessage', () => {
  it('渲染系统消息内容', () => {
    render(
      <ChatWrapper>
        <SystemMessage message={systemMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });
});

describe('MessageWrapper', () => {
  it('渲染 children', () => {
    render(
      <ChatWrapper>
        <MessageWrapper message={userMsg}>
          <span>子内容</span>
        </MessageWrapper>
      </ChatWrapper>
    );
    expect(screen.getByText('子内容')).toBeInTheDocument();
  });
});

describe('MessageItem', () => {
  it('按 role 分发到 UserMessage', () => {
    render(
      <ChatWrapper>
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('按 role 分发到 AssistantMessage', () => {
    render(
      <ChatWrapper>
        <MessageItem message={assistantMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('按 role 分发到 SystemMessage', () => {
    render(
      <ChatWrapper>
        <MessageItem message={systemMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('使用自定义消息渲染器', () => {
    const CustomMsg = ({ message }: { message: Message }) => <div>Custom: {message.content}</div>;
    render(
      <ChatWrapper context={{ renderers: { messages: { user: CustomMsg } } }}>
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Custom: Hello')).toBeInTheDocument();
  });

  it('应用 messageDecorator', () => {
    render(
      <ChatWrapper
        context={{
          messageDecorator: (msg, el) => <div data-testid="decorated">{el}</div>,
        }}
      >
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
    expect(screen.getByTestId('decorated')).toBeInTheDocument();
  });

  it('未识别的 role 使用 SystemMessage 兜底渲染', () => {
    // 使用不在内置映射中的 role（如 "tool"）触发 else 分支
    const unknownMsg: Message = { id: '4', role: 'tool', content: '工具输出', status: 'completed' };
    render(
      <ChatWrapper>
        <MessageItem message={unknownMsg} />
      </ChatWrapper>
    );
    // 应该以 SystemMessage 样式渲染内容
    expect(screen.getByText('工具输出')).toBeInTheDocument();
  });
});
