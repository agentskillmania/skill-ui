import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWrapper, expandAllCollapsed } from './testUtils.js';
import { BlocksRenderer } from '../../src/blocks-redesign/BlocksRenderer.js';
import { TextBlock } from '../../src/blocks-redesign/TextBlock.js';
import { ThinkingBlock } from '../../src/blocks-redesign/ThinkingBlock.js';
import { ToolCallBlock } from '../../src/blocks-redesign/ToolCallBlock.js';
import { PlanBlock } from '../../src/blocks-redesign/PlanBlock.js';
import { ErrorBlock } from '../../src/blocks-redesign/ErrorBlock.js';
import { HumanInputBlock } from '../../src/blocks-redesign/HumanInputBlock.js';
import type { Block } from '../../src/types.js';

const thinkingBlock: Block = {
  id: 'b1',
  type: 'thinking',
  status: 'completed',
  content: '让我想想...',
};
const toolBlock: Block = {
  id: 'b2',
  type: 'tool_call',
  status: 'completed',
  content: '',
  metadata: { toolName: 'search', toolType: 'mcp', toolArgs: '{"q":"test"}', toolResult: 'ok' },
};
const planBlock: Block = {
  id: 'b3',
  type: 'plan',
  status: 'completed',
  content: '',
  metadata: {
    steps: [
      { content: '步骤一', status: 'completed' },
      { content: '步骤二', status: 'running' },
      { content: '步骤三', status: 'pending' },
    ],
  },
};
const errorBlock: Block = {
  id: 'b4',
  type: 'error',
  status: 'error',
  content: '出错了',
  metadata: { errorCode: 'ERR_001' },
};
const humanBlock: Block = {
  id: 'b5',
  type: 'human_input',
  status: 'pending',
  content: '',
  metadata: {
    requestId: 'req1',
    inputType: 'confirmation',
    title: '确认操作',
    message: '是否继续？',
  },
};

describe('ThinkingBlock', () => {
  it('renders thinking content', () => {
    render(
      <ChatWrapper>
        <ThinkingBlock block={thinkingBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('让我想想...')).toBeInTheDocument();
  });

  it('shows thinking label in streaming status', () => {
    const streaming: Block = { ...thinkingBlock, status: 'streaming' };
    render(
      <ChatWrapper>
        <ThinkingBlock block={streaming} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('思考中')).toBeInTheDocument();
  });
});

describe('ToolCallBlock', () => {
  it('renders tool name and args', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('renders tool result', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('does not crash without metadata', () => {
    const noMeta: Block = { id: 'x', type: 'tool_call', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <ToolCallBlock block={noMeta} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('未知工具')).toBeInTheDocument();
  });

  it('renders normally when toolType is script', () => {
    const scriptBlock: Block = {
      id: 'ts1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'run-script',
        toolType: 'script',
        toolArgs: 'echo hello',
        toolResult: 'hello',
      },
    };
    render(
      <ChatWrapper>
        <ToolCallBlock block={scriptBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('run-script')).toBeInTheDocument();
    expect(screen.getByText('script')).toBeInTheDocument();
    expect(screen.getByText('echo hello')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders normally when toolType is builtin', () => {
    const builtinBlock: Block = {
      id: 'tb1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'list-files', toolType: 'builtin', toolResult: 'file1.ts' },
    };
    render(
      <ChatWrapper>
        <ToolCallBlock block={builtinBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('list-files')).toBeInTheDocument();
    expect(screen.getByText('builtin')).toBeInTheDocument();
    expect(screen.getByText('file1.ts')).toBeInTheDocument();
  });

  it('uses default color when toolType is other', () => {
    const defaultBlock: Block = {
      id: 'td1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'custom-tool', toolType: 'unknown_type' },
    };
    render(
      <ChatWrapper>
        <ToolCallBlock block={defaultBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('custom-tool')).toBeInTheDocument();
    expect(screen.getByText('unknown_type')).toBeInTheDocument();
  });

  it('renders result with error style in error status', () => {
    const errorToolBlock: Block = {
      id: 'te1',
      type: 'tool_call',
      status: 'error',
      content: '',
      metadata: { toolName: 'fail-tool', toolType: 'mcp', toolResult: '执行失败' },
    };
    render(
      <ChatWrapper>
        <ToolCallBlock block={errorToolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('fail-tool')).toBeInTheDocument();
    expect(screen.getByText('执行失败')).toBeInTheDocument();
  });

  it('renders args area when args exist but no result', () => {
    const argsOnlyBlock: Block = {
      id: 'ta1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'search', toolType: 'mcp', toolArgs: '{"q":"test"}' },
    };
    render(
      <ChatWrapper>
        <ToolCallBlock block={argsOnlyBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('shows running pill on streaming tool call, error pill on failed one', () => {
    const runningBlock: Block = {
      id: 'tc-run',
      type: 'tool_call',
      status: 'streaming',
      content: '',
      metadata: { toolName: 'run-a', toolType: 'mcp' },
    };
    const failedBlock: Block = {
      id: 'tc-fail',
      type: 'tool_call',
      status: 'error',
      content: '',
      metadata: { toolName: 'run-b', toolType: 'script' },
    };
    const { rerender } = render(
      <ChatWrapper>
        <ToolCallBlock block={runningBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('运行中')).toBeInTheDocument();
    rerender(
      <ChatWrapper>
        <ToolCallBlock block={failedBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('错误')).toBeInTheDocument();
    expect(screen.queryByText('运行中')).not.toBeInTheDocument();
  });

  it('clicking input row opens detail modal', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // Modal should not be open initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Find and click the input row (contains the args text)
    const argsRow =
      screen.getByText('{"q":"test"}').closest('div[style]') ?? screen.getByText('{"q":"test"}');
    fireEvent.click(screen.getByText('{"q":"test"}'));
    // After click, detail modal should render (antd Modal uses role="dialog")
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clicking output row opens detail modal', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('ok'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('detail modal shows tool name and tool type', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    fireEvent.click(screen.getByText('{"q":"test"}'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('search');
    expect(dialog.textContent).toContain('mcp');
  });
});

describe('PlanBlock', () => {
  it('renders plan steps', () => {
    render(
      <ChatWrapper>
        <PlanBlock block={planBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('步骤二')).toBeInTheDocument();
    expect(screen.getByText('步骤三')).toBeInTheDocument();
  });

  it('shows completion progress tag', () => {
    render(
      <ChatWrapper>
        <PlanBlock block={planBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('does not crash without steps', () => {
    const empty: Block = { id: 'x', type: 'plan', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <PlanBlock block={empty} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('执行计划')).toBeInTheDocument();
  });

  it('renders error status step (shows ✗ icon)', () => {
    const errorPlanBlock: Block = {
      id: 'p-err',
      type: 'plan',
      status: 'completed',
      content: '',
      metadata: {
        steps: [
          { content: '成功的步骤', status: 'completed' },
          { content: '失败的步骤', status: 'error' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <PlanBlock block={errorPlanBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('成功的步骤')).toBeInTheDocument();
    expect(screen.getByText('失败的步骤')).toBeInTheDocument();
    // error step uses XCircle icon (SVG), no ✗ text
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders skipped status step (shows — icon and strikethrough style)', () => {
    const skippedPlanBlock: Block = {
      id: 'p-skip',
      type: 'plan',
      status: 'completed',
      content: '',
      metadata: {
        steps: [
          { content: '执行步骤', status: 'completed' },
          { content: '跳过步骤', status: 'skipped' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <PlanBlock block={skippedPlanBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('执行步骤')).toBeInTheDocument();
    expect(screen.getByText('跳过步骤')).toBeInTheDocument();
    // skipped step uses Minus icon (SVG), no — text
  });

  it('renders pending status step (shows serial number)', () => {
    const pendingPlanBlock: Block = {
      id: 'p-pend',
      type: 'plan',
      status: 'streaming',
      content: '',
      metadata: {
        steps: [
          { content: '步骤A', status: 'completed' },
          { content: '步骤B', status: 'pending' },
          { content: '步骤C', status: 'pending' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <PlanBlock block={pendingPlanBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // pending steps use Circle icon (SVG), no numeric text
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });
});

describe('ErrorBlock', () => {
  it('renders error content and error code', () => {
    render(
      <ChatWrapper>
        <ErrorBlock block={errorBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('ERR_001')).toBeInTheDocument();
  });

  it('does not show tag without errorCode', () => {
    const noCode: Block = { id: 'x', type: 'error', status: 'error', content: '错误' };
    render(
      <ChatWrapper>
        <ErrorBlock block={noCode} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('错误')).toBeInTheDocument();
  });

  it('renders hint when metadata provides it', () => {
    const hintBlock: Block = {
      id: 'eh1',
      type: 'error',
      status: 'error',
      content: '连接失败',
      metadata: { errorCode: 'NET_ERR', hint: '请检查网络连接后重试' },
    };
    render(
      <ChatWrapper>
        <ErrorBlock block={hintBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('连接失败')).toBeInTheDocument();
    expect(screen.getByText('NET_ERR')).toBeInTheDocument();
    expect(screen.getByText('请检查网络连接后重试')).toBeInTheDocument();
  });

  it('does not render hint section when no hint in metadata', () => {
    const noHint: Block = {
      id: 'enh1',
      type: 'error',
      status: 'error',
      content: '崩溃',
      metadata: { errorCode: 'FATAL' },
    };
    render(
      <ChatWrapper>
        <ErrorBlock block={noHint} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('崩溃')).toBeInTheDocument();
    expect(screen.getByText('FATAL')).toBeInTheDocument();
    // No hint section should exist — the container should have exactly 2 children (header + body)
    const pre = screen.getByText('崩溃').closest('pre');
    expect(pre?.nextElementSibling).toBeNull();
  });
});

describe('HumanInputBlock', () => {
  it('renders confirmation interaction', () => {
    render(
      <ChatWrapper>
        <HumanInputBlock block={humanBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('是否继续？')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(buttons[0]).toBeInTheDocument();
  });

  it('clicking confirm triggers callback', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    fireEvent.click(screen.getByText('确认'));
    expect(onConfirm).toHaveBeenCalledWith('req1', true);
  });

  it('completed status shows completed', () => {
    const done: Block = { ...humanBlock, status: 'completed' };
    render(
      <ChatWrapper>
        <HumanInputBlock block={done} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('已回复')).toBeInTheDocument();
  });

  it('input type renders input box', () => {
    const inputBlock: Block = {
      ...humanBlock,
      metadata: { ...humanBlock.metadata, inputType: 'input' },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={inputBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByPlaceholderText('请输入...')).toBeInTheDocument();
  });

  it('single-select type renders options', () => {
    const selectBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'single-select',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={selectBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('选项A')).toBeInTheDocument();
    expect(screen.getByText('选项B')).toBeInTheDocument();
  });

  it('multi-select type renders options', () => {
    const multiBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'multi-select',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={multiBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('选项A')).toBeInTheDocument();
    expect(screen.getByText('选项B')).toBeInTheDocument();
  });

  it('input type clicking submit button triggers callback', () => {
    const onConfirm = vi.fn();
    const inputBlock: Block = {
      ...humanBlock,
      metadata: { ...humanBlock.metadata, inputType: 'input', defaultValue: '默认值' },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={inputBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // input type should have input box and submit button
    const input = screen.getByPlaceholderText('请输入...');
    expect(input).toBeInTheDocument();
    fireEvent.click(screen.getByText('提交'));
    expect(onConfirm).toHaveBeenCalledWith('req1', '默认值');
  });

  it('single-select type submit button is disabled when nothing selected', () => {
    const onConfirm = vi.fn();
    const selectBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'single-select',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={selectBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // Submit button is disabled when no option selected
    const submitBtn = screen.getByText('提交');
    expect(submitBtn).toBeDisabled();
  });

  it('multi-select type with default value clicking submit button triggers callback', () => {
    const onConfirm = vi.fn();
    const multiBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'multi-select',
        defaultValue: 'a',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={multiBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // has defaultValue='a', so selectedValues is initially ['a'], submit button enabled
    const submitBtn = screen.getByText('提交');
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(onConfirm).toHaveBeenCalledWith('req1', ['a']);
  });

  it('confirmation type clicking cancel triggers callback', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    fireEvent.click(screen.getByText('取消'));
    expect(onConfirm).toHaveBeenCalledWith('req1', false);
  });

  it('uses block.id when no requestId', () => {
    const onConfirm = vi.fn();
    const noReqId: Block = {
      ...humanBlock,
      metadata: { inputType: 'confirmation', title: '请确认操作' },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={noReqId} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // title is "请确认操作", button is "确认" — no ambiguity
    fireEvent.click(screen.getByText('确认'));
    // requestId should fallback to block.id
    expect(onConfirm).toHaveBeenCalledWith('b5', true);
  });

  it('uses default values when no metadata', () => {
    const noMetaBlock: Block = {
      id: 'no-meta',
      type: 'human_input',
      status: 'pending',
      content: '',
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={noMetaBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // inputType defaults to 'confirmation', title defaults to '需要确认'
    expect(screen.getByText('需要确认')).toBeInTheDocument();
    expect(screen.getByText('等待中')).toBeInTheDocument();
  });

  it('input type inputs value and submits', () => {
    const onConfirm = vi.fn();
    const inputBlock: Block = {
      ...humanBlock,
      metadata: { ...humanBlock.metadata, inputType: 'input' },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={inputBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // input box exists
    const input = screen.getByPlaceholderText('请输入...');
    // modify input value
    fireEvent.change(input, { target: { value: 'hello' } });
    // click submit button
    fireEvent.click(screen.getByText('提交'));
    expect(onConfirm).toHaveBeenCalledWith('req1', 'hello');
  });

  it('single-select type selects and submits triggers callback', () => {
    const onConfirm = vi.fn();
    const selectBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'single-select',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={selectBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // select an option
    fireEvent.click(screen.getByText('选项A'));
    // now submit button should be enabled
    const submitBtn = screen.getByText('提交');
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(onConfirm).toHaveBeenCalledWith('req1', 'a');
  });

  it('multi-select type selects and submits triggers callback', () => {
    const onConfirm = vi.fn();
    const multiBlock: Block = {
      ...humanBlock,
      metadata: {
        ...humanBlock.metadata,
        inputType: 'multi-select',
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={multiBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // select an option
    fireEvent.click(screen.getByText('选项A'));
    // now submit button should be enabled
    const submitBtn = screen.getByText('提交');
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(onConfirm).toHaveBeenCalledWith('req1', ['a']);
  });

  it('streaming status is also treated as pending', () => {
    const streamingBlock: Block = {
      ...humanBlock,
      status: 'streaming',
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={streamingBlock} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('等待中')).toBeInTheDocument();
  });

  it('completed with object response shows JSON.stringify fallback', () => {
    const completedWithObj: Block = {
      ...humanBlock,
      status: 'completed',
      metadata: { ...humanBlock.metadata, response: { text: 'hello' } },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={completedWithObj} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // plain objects (not tagged enums / answers) are JSON.stringified
    expect(screen.getByText('{"text":"hello"}')).toBeInTheDocument();
  });

  it('completed with number response shows stringified number', () => {
    const completedWithNum: Block = {
      ...humanBlock,
      status: 'completed',
      metadata: { ...humanBlock.metadata, response: 42 },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={completedWithNum} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('completed with array response shows joined values', () => {
    const completedWithArr: Block = {
      ...humanBlock,
      status: 'completed',
      metadata: { ...humanBlock.metadata, response: ['a', 'b'] },
    };
    render(
      <ChatWrapper>
        <HumanInputBlock block={completedWithArr} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('a, b')).toBeInTheDocument();
  });
});

describe('BlocksRenderer', () => {
  it('renders multiple block types', () => {
    const blocks: Block[] = [thinkingBlock, toolBlock, planBlock, errorBlock];
    render(
      <ChatWrapper>
        <BlocksRenderer blocks={blocks} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('让我想想...')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('出错了')).toBeInTheDocument();
  });

  it('uses custom block renderer', () => {
    const CustomBlock = ({ block }: { block: Block }) => <div>Custom: {block.type}</div>;
    render(
      <ChatWrapper>
        <BlocksRenderer
          blocks={[thinkingBlock]}
          renderers={{ blocks: { thinking: CustomBlock } }}
        />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Custom: thinking')).toBeInTheDocument();
  });

  it('skips rendering unknown block type', () => {
    const unknown: Block = { id: 'x', type: 'unknown_type', status: 'completed', content: '...' };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[unknown]} />
      </ChatWrapper>
    );
    // should only have container div, no block content
    expect(container.textContent).toBe('');
  });

  it('renders text blocks inline in array order (interleaved with other blocks)', () => {
    // The chronological invariant: a text segment between two blocks renders
    // BETWEEN them, not after all blocks.
    const blocks: Block[] = [
      { id: 't1', type: 'text', status: 'completed', content: '第一段文字' },
      toolBlock,
      { id: 't2', type: 'text', status: 'completed', content: '第二段文字' },
    ];
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={blocks} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    const text = container.textContent ?? '';
    expect(text).toContain('第一段文字');
    expect(text).toContain('第二段文字');
    const i1 = text.indexOf('第一段文字');
    const iTool = text.indexOf('search');
    const i2 = text.indexOf('第二段文字');
    expect(i1).toBeGreaterThanOrEqual(0);
    expect(iTool).toBeGreaterThan(i1);
    expect(i2).toBeGreaterThan(iTool);
  });

  it('adapts shell tool_calls to ShellBlock (command from args, exit code from output)', () => {
    const shellCall: Block = {
      id: 'sh1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'shell',
        toolArgs: '{"command":"ls -la"}',
        toolResult: 'Exit code: 3\nboom',
      },
    };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[shellCall]} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    const text = container.textContent ?? '';
    expect(text).toContain('ls -la');
    expect(text).toContain('exit 3');
  });

  it('falls back to raw toolArgs as the command when args are not JSON', () => {
    const shellCall: Block = {
      id: 'sh2',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'shell', toolArgs: '{not-json', toolResult: 'ok' },
    };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[shellCall]} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(container.textContent).toContain('{not-json');
  });

  it('lets a custom renderer override the shell adaptation', () => {
    const shellCall: Block = {
      id: 'sh3',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'shell', toolArgs: '{"command":"pwd"}', toolResult: '/' },
    };
    const CustomShell = ({ block }: { block: Block }) => (
      <div>custom shell: {(block.metadata as { command?: string }).command}</div>
    );
    render(
      <ChatWrapper>
        <BlocksRenderer blocks={[shellCall]} renderers={{ blocks: { shell: CustomShell } }} />
      </ChatWrapper>
    );
    expect(screen.getByText('custom shell: pwd')).toBeInTheDocument();
  });

  it('adapts file_edit tool_calls to FileEditBlock (diff from args, count from receipt)', () => {
    const editCall: Block = {
      id: 'fe1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'file_edit',
        toolArgs: JSON.stringify({ filePath: 'a.ts', oldString: 'x\n', newString: 'y\n' }),
        toolResult: 'Edited a.ts: Successfully replaced 1 occurrence\nUpdated region:\n7→y;',
      },
    };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[editCall]} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    const text = container.textContent ?? '';
    expect(text).toContain('文件编辑');
    expect(text).toContain('+1');
    expect(text).toContain('-1');
  });

  it('falls back to generic tool_call rendering for file_edit with corrupted args', () => {
    const editCall: Block = {
      id: 'fe2',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'file_edit', toolArgs: '{not-json', toolResult: 'Error: bad' },
    };
    render(
      <ChatWrapper>
        <BlocksRenderer blocks={[editCall]} />
      </ChatWrapper>
    );
    // 专用块未命中:无 diff 徽标,通用块直接展示工具名
    expect(screen.queryByText('文件编辑')).not.toBeInTheDocument();
    expect(screen.getByText('file_edit')).toBeInTheDocument();
  });

  it('lets a custom file_edit renderer override the adaptation', () => {
    const editCall: Block = {
      id: 'fe3',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'file_edit',
        toolArgs: JSON.stringify({ filePath: 'a.ts', oldString: 'x\n', newString: 'y\n' }),
      },
    };
    const CustomEdit = ({ block }: { block: Block }) => (
      <div>custom edit: {(block.metadata as { filePath?: string }).filePath}</div>
    );
    render(
      <ChatWrapper>
        <BlocksRenderer blocks={[editCall]} renderers={{ blocks: { file_edit: CustomEdit } }} />
      </ChatWrapper>
    );
    expect(screen.getByText('custom edit: a.ts')).toBeInTheDocument();
  });

  it('tool_call-level custom renderer wins over the file_edit adaptation', () => {
    const editCall: Block = {
      id: 'fe4',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'file_edit',
        toolArgs: JSON.stringify({ filePath: 'a.ts', oldString: 'x\n', newString: 'y\n' }),
      },
    };
    const CustomGeneric = ({ block }: { block: Block }) => (
      <div>generic: {(block.metadata as { toolName?: string }).toolName}</div>
    );
    render(
      <ChatWrapper>
        <BlocksRenderer blocks={[editCall]} renderers={{ blocks: { tool_call: CustomGeneric } }} />
      </ChatWrapper>
    );
    expect(screen.getByText('generic: file_edit')).toBeInTheDocument();
    expect(screen.queryByText('文件编辑')).not.toBeInTheDocument();
  });

  it('shell adaptation: metadata.command wins, output falls back to block content', () => {
    // command provided directly (no toolArgs parse) + no toolResult →
    // ShellBlock output comes from block.content; running status keeps the
    // exit code unset (no "exit N" badge).
    const running: Block = {
      id: 'sh4',
      type: 'tool_call',
      status: 'streaming',
      content: 'partial output',
      metadata: { toolName: 'shell', command: 'npm test' },
    };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[running]} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    const text = container.textContent ?? '';
    expect(text).toContain('npm test');
    expect(text).toContain('partial output');
    expect(text).not.toContain('exit 0');
  });
});

describe('TextBlock', () => {
  it('renders block content as markdown', () => {
    render(
      <ChatWrapper>
        <TextBlock block={{ id: 't1', type: 'text', status: 'completed', content: '**加粗**' }} />
      </ChatWrapper>
    );
    expect(screen.getByText('加粗')).toBeInTheDocument();
  });

  it('renders nothing for empty content', () => {
    const { container } = render(
      <ChatWrapper>
        <TextBlock block={{ id: 't1', type: 'text', status: 'completed', content: '' }} />
      </ChatWrapper>
    );
    expect(container.textContent).toBe('');
  });

  it('renders normally while streaming (streaming flag forwarded to markdown)', () => {
    const { container } = render(
      <ChatWrapper>
        <TextBlock block={{ id: 't1', type: 'text', status: 'streaming', content: '进行中' }} />
      </ChatWrapper>
    );
    expect(container.textContent).toContain('进行中');
  });
});

// 多问题 HITL 应答显示:实时路径(human-input-resolved 信封)与历史路径
// (裸 answers map)都必须完整显示两题,不再只剩第一题(回归:旧的
// "首个键为对象即解包"启发式把问题 id 当 serde 标签误拆)。
describe('HumanInputBlock > multi-question answered display', () => {
  const questions = [
    { id: 'q1', question: 'Which way?', type: 'single-select', options: ['A', 'B'] },
    { id: 'q2', question: 'Feedback?', type: 'text' },
  ];
  const answers = {
    q1: { type: 'direct', value: 'A' },
    q2: { type: 'free-text', value: 'looks good' },
  };

  it('live path: renders every answer from the resolved-event envelope', () => {
    render(
      <ChatWrapper>
        <HumanInputBlock
          block={{
            id: 'b1',
            type: 'human_input',
            status: 'completed',
            content: '',
            metadata: { requestId: 'r1', questions, response: { type: 'question', answers } },
          }}
        />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Which way?: A')).toBeInTheDocument();
    expect(screen.getByText('Feedback?: looks good')).toBeInTheDocument();
  });

  it('history path: renders every answer from the raw answers map', () => {
    render(
      <ChatWrapper>
        <HumanInputBlock
          block={{
            id: 'b1',
            type: 'human_input',
            status: 'completed',
            content: '',
            metadata: { requestId: 'r1', questions, response: answers },
          }}
        />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Which way?: A')).toBeInTheDocument();
    expect(screen.getByText('Feedback?: looks good')).toBeInTheDocument();
  });
});
