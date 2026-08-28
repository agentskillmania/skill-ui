import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('autoFocus focuses the textarea', () => {
    render(
      <ChatWrapper>
        <ChatInput autoFocus value="" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toHaveFocus();
  });

  it('disables textarea transitions (autoSize mount correction must not animate)', () => {
    // autoSize 初次校正在挂载后落地,antd .ant-input 的 transition:all 会把
    // 高度校正播成渐变 —— 按会话重挂载输入框的宿主(gmemo)每次切换都会
    // 看到输入栏缩一下。inline transition:none 钉死这个契约。
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    expect(textarea.style.transition).toBe('none');
  });

  it('does not steal focus without autoFocus', () => {
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).not.toHaveFocus();
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

  it('renders banner on its own row above the input row', () => {
    render(
      <ChatWrapper>
        <ChatInput banner={<div>mode-banner</div>} />
      </ChatWrapper>
    );
    const banner = screen.getByText('mode-banner');
    const dropzone = document.querySelector('[data-testid="chat-input-dropzone"]');
    expect(dropzone).toBeTruthy();
    // Banner precedes the input row in DOM order (stacked above, not inline
    // like prefix/suffix).
    expect(
      banner.compareDocumentPosition(dropzone!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
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

  it('selecting a command writes it into the input instead of firing it', async () => {
    const onCommand = vi.fn();
    const onChange = vi.fn();
    render(
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
    // Selecting only writes the command — it must NOT execute onCommand.
    expect(onCommand).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('/search');
  });

  it('renders senderElement directly without commands', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
  });

  it('empty commands list never opens the autocomplete panel', () => {
    render(
      <ChatWrapper>
        <ChatInput value="/" onChange={() => {}} commands={[]} onCommand={() => {}} />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toBeInTheDocument();
    // onCommand 存在即包 CommandAutocomplete(wrapper 稳定,见下条回归测试),
    // 但空列表时面板被 visible 抑制 —— 用户不可见。
    expect(document.querySelector('[data-testid="cmd-empty"]')).toBeNull();
    expect(document.querySelector('[data-testid="cmd-item"]')).toBeNull();
  });

  it('commands arriving asynchronously must not remount the textarea or drop focus', () => {
    // 回归:wrapper 曾按 commands.length>0 条件挂载 —— 宿主命令异步加载
    // 到达时返回值根类型从 div 翻成 CommandAutocomplete,React 整树重挂载,
    // textarea 重建、autoFocus 焦点丢失且 [autoFocus] effect 不会重发。
    const onCommand = vi.fn();
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput autoFocus value="" onChange={() => {}} commands={[]} onCommand={onCommand} />
      </ChatWrapper>
    );
    const before = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    expect(before).toHaveFocus();

    rerender(
      <ChatWrapper>
        <ChatInput
          autoFocus
          value=""
          onChange={() => {}}
          commands={mockCommands}
          onCommand={onCommand}
        />
      </ChatWrapper>
    );
    const after = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    expect(after).toBe(before); // 同一 DOM 节点 = 没有重挂载
    expect(after).toHaveFocus();
  });

  it('refocuses the new node if the Sender subtree is remounted while autoFocus stays on', () => {
    // callback ref 加固:autoFocus 值没变,effect 类方案在重挂载后不会重发;
    // callback ref 随新节点到达重新聚焦。
    const onCommand = vi.fn();
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput
          key="a"
          autoFocus
          value=""
          onChange={() => {}}
          commands={mockCommands}
          onCommand={onCommand}
        />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toHaveFocus();

    rerender(
      <ChatWrapper>
        <ChatInput
          key="b"
          autoFocus
          value=""
          onChange={() => {}}
          commands={mockCommands}
          onCommand={onCommand}
        />
      </ChatWrapper>
    );
    expect(screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)')).toHaveFocus();
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

  it('toolbar quick-command click writes the command into the input', () => {
    const onCommand = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="" onChange={onChange} commands={mockCommands} onCommand={onCommand} />
      </ChatWrapper>
    );
    expect(screen.getByTestId('chat-input-toolbar')).toBeInTheDocument();
    const capsules = screen.getAllByTestId('quick-command');
    expect(capsules).toHaveLength(2);
    fireEvent.click(capsules[0]);
    expect(onCommand).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('/search');
  });

  it('submitting a slash message fires onCommand instead of onSubmit', () => {
    const onCommand = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput
          value="/search"
          onChange={() => {}}
          onSubmit={onSubmit}
          commands={mockCommands}
          onCommand={onCommand}
        />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1', command: 'search' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('slash message with args still resolves the command', () => {
    const onCommand = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput
          value="/search 知识库"
          onChange={() => {}}
          onSubmit={onSubmit}
          commands={mockCommands}
          onCommand={onCommand}
        />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1', command: 'search' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('unknown slash message is sent as plain text', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput
          value="/unknown"
          onChange={() => {}}
          onSubmit={onSubmit}
          commands={mockCommands}
          onCommand={() => {}}
        />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('/unknown');
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
    const { container } = render(
      <ChatWrapper>
        <ChatInput value="" onChange={() => {}} contextUsage={{ used: 12000, total: 200000 }} />
      </ChatWrapper>
    );
    const usage = screen.getByTestId('context-usage');
    expect(usage.textContent).toContain('12k');
    expect(usage.textContent).toContain('200k');

    // The ring sits directly on bgBase, where light themes' `fill` equals bgBase
    // exactly — the rail must use a visible border-family color instead.
    const rail = container.querySelector('.ant-progress-circle-rail');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('stroke')).toBe('#cbd5e1'); // lightTheme.borderHover
  });
});

describe('ChatInput — attachments', () => {
  const pngFile = (name = 'shot.png', size = 1024) =>
    new File([new Uint8Array(size)], name, { type: 'image/png' });
  const attachment = (id: string) => ({
    id,
    name: `${id}.png`,
    mimeType: 'image/png',
    url: `data:image/png;base64,${id}`,
    size: 1024,
  });

  it('renders pending attachments as chips; × removes that one', () => {
    const onAttachmentsChange = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput
          attachments={[attachment('a1'), attachment('a2')]}
          onAttachmentsChange={onAttachmentsChange}
        />
      </ChatWrapper>
    );
    expect(screen.getByTestId('attachment-chips')).toBeInTheDocument();
    expect(screen.getByText('a1.png')).toBeInTheDocument();
    const removeButtons = screen.getAllByLabelText('移除附件');
    fireEvent.click(removeButtons[0]);
    expect(onAttachmentsChange).toHaveBeenCalledWith([attachment('a2')]);
  });

  it('attach button requires onAttachmentsChange; disabled by attachmentsDisabled', () => {
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput />
      </ChatWrapper>
    );
    expect(screen.queryByTestId('attach-button')).toBeNull();

    rerender(
      <ChatWrapper>
        <ChatInput onAttachmentsChange={() => {}} attachmentsDisabled />
      </ChatWrapper>
    );
    expect(screen.getByTestId('attach-button')).toBeDisabled();
  });

  it('drop an image converts it to an attachment (data URL)', async () => {
    const onAttachmentsChange = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput attachments={[]} onAttachmentsChange={onAttachmentsChange} />
      </ChatWrapper>
    );
    fireEvent.drop(screen.getByTestId('chat-input-dropzone'), {
      dataTransfer: { files: [pngFile()] },
    });
    await waitFor(() => expect(onAttachmentsChange).toHaveBeenCalled());
    const next = onAttachmentsChange.mock.calls[0][0];
    expect(next).toHaveLength(1);
    expect(next[0].name).toBe('shot.png');
    expect(next[0].mimeType).toBe('image/png');
    expect(next[0].url).toMatch(/^data:image\/png;base64,/);
    expect(next[0].size).toBe(1024);
  });

  it('drop is rejected with reason when disabled / wrong type / too many / too large', () => {
    const onAttachmentsRejected = vi.fn();
    const change = vi.fn();
    const { rerender } = render(
      <ChatWrapper>
        <ChatInput
          attachments={[]}
          onAttachmentsChange={change}
          attachmentsDisabled
          onAttachmentsRejected={onAttachmentsRejected}
        />
      </ChatWrapper>
    );
    const drop = (files: File[]) =>
      fireEvent.drop(screen.getByTestId('chat-input-dropzone'), {
        dataTransfer: { files },
      });

    drop([pngFile()]);
    expect(onAttachmentsRejected).toHaveBeenLastCalledWith('disabled', [expect.any(File)]);

    rerender(
      <ChatWrapper>
        <ChatInput
          attachments={[]}
          onAttachmentsChange={change}
          onAttachmentsRejected={onAttachmentsRejected}
        />
      </ChatWrapper>
    );
    drop([new File(['x'], 'doc.txt', { type: 'text/plain' })]);
    expect(onAttachmentsRejected).toHaveBeenLastCalledWith('unsupported-type', [expect.any(File)]);

    drop([pngFile('1'), pngFile('2'), pngFile('3'), pngFile('4'), pngFile('5'), pngFile('6')]);
    expect(onAttachmentsRejected).toHaveBeenLastCalledWith('too-many', expect.any(Array));

    drop([pngFile('big.png', 11 * 1024 * 1024)]);
    expect(onAttachmentsRejected).toHaveBeenLastCalledWith('too-large', [expect.any(File)]);
    expect(change).not.toHaveBeenCalled();
  });

  it('submit passes attachments as the second argument', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="看图说话" attachments={[attachment('a1')]} onSubmit={onSubmit} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('看图说话', [attachment('a1')]);
  });

  it('image-only submit (empty text + attachments) is allowed', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="" attachments={[attachment('a1')]} onSubmit={onSubmit} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('', [attachment('a1')]);
  });

  it('plain submit without attachments keeps single-argument semantics', () => {
    const onSubmit = vi.fn();
    render(
      <ChatWrapper>
        <ChatInput value="纯文本" onSubmit={onSubmit} />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText('输入消息... (Shift+Enter 换行)');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('纯文本');
    // 单参形态:第二参不存在(而不是显式 undefined)——宿主旧的
    // toHaveBeenCalledWith('...') 断言不受影响。
    expect(onSubmit.mock.calls[0]).toHaveLength(1);
  });
});

describe('ChatInput — input history recall', () => {
  const PLACEHOLDER = '输入消息... (Shift+Enter 换行)';

  /** 提交一条消息:受控 rerender 到该值 + Enter。返回 rerender 供继续编排。 */
  function setup(initialValue = '') {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const view = render(
      <ChatWrapper>
        <ChatInput value={initialValue} onChange={onChange} onSubmit={onSubmit} />
      </ChatWrapper>
    );
    const textarea = () => screen.getByPlaceholderText(PLACEHOLDER) as HTMLTextAreaElement;
    const send = (text: string) => {
      view.rerender(
        <ChatWrapper>
          <ChatInput value={text} onChange={onChange} onSubmit={onSubmit} />
        </ChatWrapper>
      );
      fireEvent.keyDown(textarea(), { key: 'Enter', code: 'Enter' });
      // 宿主契约:提交后清空输入(草稿基线为 '')
      view.rerender(
        <ChatWrapper>
          <ChatInput value="" onChange={onChange} onSubmit={onSubmit} />
        </ChatWrapper>
      );
    };
    const up = (init?: Record<string, unknown>) =>
      fireEvent.keyDown(textarea(), { key: 'ArrowUp', code: 'ArrowUp', ...init });
    const down = (init?: Record<string, unknown>) =>
      fireEvent.keyDown(textarea(), { key: 'ArrowDown', code: 'ArrowDown', ...init });
    return { onChange, onSubmit, send, up, down, textarea, ...view };
  }

  it('ArrowUp recalls the last submitted message', () => {
    const { send, up, onChange } = setup();
    send('第一条');
    onChange.mockClear();
    up();
    expect(onChange).toHaveBeenCalledWith('第一条');
  });

  it('ArrowUp/Down walk through history; past the newest restores the draft', () => {
    const { send, up, down, onChange } = setup();
    send('旧消息');
    send('新消息');
    onChange.mockClear();
    up(); // → 新消息
    up(); // → 旧消息
    expect(onChange).toHaveBeenLastCalledWith('旧消息');
    down(); // → 新消息
    expect(onChange).toHaveBeenLastCalledWith('新消息');
    down(); // past newest → draft ('' at this point)
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('a non-empty in-progress draft is restored when walking back down', () => {
    const { send, rerender, up, down, onChange } = setup();
    send('已发送');
    rerender(
      <ChatWrapper>
        <ChatInput value="写到一半" onChange={onChange} onSubmit={vi.fn()} />
      </ChatWrapper>
    );
    up(); // → 已发送 (draft saved: 写到一半)
    down(); // → draft restored
    expect(onChange).toHaveBeenLastCalledWith('写到一半');
  });

  it('ArrowUp clamps at the oldest entry (value unchanged, key consumed)', () => {
    const { send, up, onChange } = setup();
    send('only-one');
    onChange.mockClear();
    up();
    up();
    up();
    // 仍然是最旧(也是唯一)一条,不越界、不重复触发其它值。
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('only-one');
  });

  // JSX 属性字符串不做 \n 转义(HTML 属性语义),多行值必须走 JS 表达式。
  const MULTILINE = 'line1\nline2';

  it('ArrowUp does not recall when the caret is not on the first line', () => {
    const { send, rerender, up, onChange, textarea } = setup();
    send('历史');
    onChange.mockClear();
    // 宿主回显多行草稿,光标放第二行(rerender 而非 fireEvent.change:
    // 受控组件的 DOM 值由 React 还原,change 模拟不真实)
    rerender(
      <ChatWrapper>
        <ChatInput value={MULTILINE} onChange={onChange} onSubmit={vi.fn()} />
      </ChatWrapper>
    );
    textarea().selectionStart = 6; // 换行符之后 = 第二行行首
    up();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowDown does not recall when the caret is not on the last line', () => {
    const { send, rerender, up, down, onChange, textarea } = setup();
    send('历史');
    onChange.mockClear();
    up(); // 进入回溯态
    onChange.mockClear();
    rerender(
      <ChatWrapper>
        <ChatInput value={MULTILINE} onChange={onChange} onSubmit={vi.fn()} />
      </ChatWrapper>
    );
    textarea().selectionStart = 0; // 第一行
    down();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowDown outside browsing mode passes through (no onChange)', () => {
    const { down, onChange } = setup('随便打点字');
    down();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('consecutive duplicate submits collapse into one entry', () => {
    const { send, up, onChange } = setup();
    send('更旧的一条');
    send('重复');
    send('重复');
    onChange.mockClear();
    up(); // → 重复(最新)
    up(); // 越过重复 → 更旧的一条
    expect(onChange).toHaveBeenLastCalledWith('更旧的一条');
    up(); // 已是最旧,停住
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('resending a recalled message resets the pointer (no stack growth)', () => {
    const { send, up, onChange } = setup();
    send('A');
    send('B');
    onChange.mockClear();
    up(); // → B(最新)
    // 宿主回显召回值后直接回车重发:连续去重,栈不增长、指针归位
    send('B');
    onChange.mockClear();
    up(); // → 仍是 B(未重复入栈)
    up(); // → A
    expect(onChange).toHaveBeenLastCalledWith('A');
  });

  it('command panel visible: ArrowUp drives the panel, not history', async () => {
    const onChange = vi.fn();
    const view = render(
      <ChatWrapper>
        <ChatInput
          value="历史文本"
          onChange={onChange}
          onSubmit={vi.fn()}
          onCommand={vi.fn()}
          commands={mockCommands}
        />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText(PLACEHOLDER) as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' }); // 纯文本提交,入历史
    view.rerender(
      <ChatWrapper>
        <ChatInput value="/" onChange={onChange} onCommand={vi.fn()} commands={mockCommands} />
      </ChatWrapper>
    );
    await waitFor(() => {
      expect(document.querySelector('[data-testid="cmd-panel"]')).toBeTruthy();
    });
    onChange.mockClear();
    fireEvent.keyDown(textarea, { key: 'ArrowUp', code: 'ArrowUp' });
    // 面板消费按键(preventDefault):历史不写值,active 高亮 wrap 到最后一项
    expect(onChange).not.toHaveBeenCalled();
    const active = document.querySelector('[data-testid="cmd-item"][data-active]');
    expect(active?.getAttribute('data-index')).toBe('1');
  });

  it('ArrowUp does not recall during IME composition', () => {
    const { send, up, onChange } = setup();
    send('历史');
    onChange.mockClear();
    up({ isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('modified arrows do not recall', () => {
    const { send, up, onChange } = setup();
    send('历史');
    onChange.mockClear();
    up({ shiftKey: true });
    up({ ctrlKey: true });
    up({ metaKey: true });
    up({ altKey: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowUp with empty history passes through', () => {
    const { up, onChange } = setup();
    up();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('caps history at 50 entries (oldest fall off)', () => {
    const { send, up, onChange } = setup();
    for (let i = 1; i <= 55; i++) send(`msg-${i}`);
    onChange.mockClear();
    up(); // → msg-55
    expect(onChange).toHaveBeenLastCalledWith('msg-55');
    // 到最旧(msg-6)需 49 次有效 ↑;多按的停在最旧不再写值
    for (let i = 0; i < 54; i++) up();
    expect(onChange).toHaveBeenLastCalledWith('msg-6');
    up(); // 已是最旧,停住
    // 1 次进入回溯 + 49 次有效前翻 = 50 次写值
    expect(onChange).toHaveBeenCalledTimes(50);
  });

  it('slash command submissions are recorded in history', () => {
    const onChange = vi.fn();
    const onCommand = vi.fn();
    const view = render(
      <ChatWrapper>
        <ChatInput
          value="/search"
          onChange={onChange}
          onCommand={onCommand}
          commands={mockCommands}
        />
      </ChatWrapper>
    );
    const textarea = screen.getByPlaceholderText(PLACEHOLDER) as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onCommand).toHaveBeenCalled();
    // 命令面板此时应已因值变化关闭(dismissed);值为空时按 ↑ 召回命令
    view.rerender(
      <ChatWrapper>
        <ChatInput value="" onChange={onChange} onCommand={onCommand} commands={mockCommands} />
      </ChatWrapper>
    );
    onChange.mockClear();
    fireEvent.keyDown(textarea, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('/search');
  });
});
