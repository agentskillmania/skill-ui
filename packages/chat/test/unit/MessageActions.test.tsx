/**
 * MessageActions component tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
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
const errorMsg: Message = {
  id: 'a3',
  role: 'assistant',
  content: 'boom',
  status: 'error',
};
const systemMsg: Message = { id: 's1', role: 'system', content: 'notice', status: 'completed' };
const toolMsg: Message = { id: 't1', role: 'tool', content: 'result', status: 'completed' };

function getButtons(container: HTMLElement) {
  return container.querySelectorAll('button');
}

describe('MessageActions', () => {
  it('returns null for system messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={systemMsg} onCopy={() => {}} />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('returns null for tool messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={toolMsg} onCopy={() => {}} />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('returns null when no callback is wired (wiring is the switch)', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} isLastCompletedAssistant />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('returns null when hideActions is set (streaming guard)', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          isLastCompletedAssistant
          hideActions
          onCopy={() => {}}
          onRegenerate={() => {}}
        />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('renders copy only for a non-last user message', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} onCopy={() => {}} onEdit={() => {}} />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(1);
  });

  it('renders copy + edit for the last user message', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} isLastUserMessage onCopy={() => {}} onEdit={() => {}} />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(2);
  });

  it('calls onCopy when copy button clicked', () => {
    const onCopy = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onCopy={onCopy} />
      </ChatWrapper>
    );
    const buttons = getButtons(container);
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);
    expect(onCopy).toHaveBeenCalledWith(assistantMsg);
  });

  it('calls onEdit when edit button clicked on the last user message', () => {
    const onEdit = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={userMsg} isLastUserMessage onCopy={() => {}} onEdit={onEdit} />
      </ChatWrapper>
    );
    const buttons = getButtons(container);
    fireEvent.click(buttons[1]); // second button is edit
    expect(onEdit).toHaveBeenCalledWith(userMsg);
  });

  it('renders copy + regenerate for the last completed assistant message', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          isLastCompletedAssistant
          onCopy={() => {}}
          onEdit={() => {}}
          onRegenerate={() => {}}
          onRollback={() => {}}
          onFork={() => {}}
        />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(2);
  });

  it('calls onRegenerate when regenerate button clicked on the last completed assistant', () => {
    const onRegenerate = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          isLastCompletedAssistant
          onCopy={() => {}}
          onRegenerate={onRegenerate}
        />
      </ChatWrapper>
    );
    const buttons = getButtons(container);
    fireEvent.click(buttons[1]); // second button is regenerate
    expect(onRegenerate).toHaveBeenCalledWith(assistantMsg);
  });

  it('renders copy + rollback + fork for a non-last completed assistant message', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          onCopy={() => {}}
          onRegenerate={() => {}}
          onRollback={() => {}}
          onFork={() => {}}
        />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(3);
  });

  it('calls onRollback when rollback button clicked on a non-last assistant', () => {
    const onRollback = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onCopy={() => {}} onRollback={onRollback} />
      </ChatWrapper>
    );
    const buttons = getButtons(container);
    fireEvent.click(buttons[1]); // second button is rollback
    expect(onRollback).toHaveBeenCalledWith(assistantMsg);
  });

  it('calls onFork when fork button clicked on a non-last assistant', () => {
    const onFork = vi.fn();
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onCopy={() => {}} onFork={onFork} />
      </ChatWrapper>
    );
    const buttons = getButtons(container);
    fireEvent.click(buttons[1]); // second button is fork (rollback not wired)
    expect(onFork).toHaveBeenCalledWith(assistantMsg);
  });

  it('does not render rollback/fork on the last completed assistant even if wired', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          isLastCompletedAssistant
          onCopy={() => {}}
          onRollback={() => {}}
          onFork={() => {}}
        />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(1); // copy only
  });

  it('does not render regenerate on a non-last completed assistant even if wired', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions message={assistantMsg} onCopy={() => {}} onRegenerate={() => {}} />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(1); // copy only
  });

  it('returns null for streaming assistant messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={streamingMsg}
          isLastCompletedAssistant
          onCopy={() => {}}
          onRegenerate={() => {}}
        />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('returns null for error assistant messages', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={errorMsg}
          isLastCompletedAssistant
          onCopy={() => {}}
          onRegenerate={() => {}}
        />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('renders with ghost variant', () => {
    const { container } = render(
      <ChatWrapper>
        <MessageActions
          message={assistantMsg}
          variant="ghost"
          onCopy={() => {}}
          onRollback={() => {}}
          onFork={() => {}}
        />
      </ChatWrapper>
    );
    expect(getButtons(container).length).toBe(3);
  });
});
