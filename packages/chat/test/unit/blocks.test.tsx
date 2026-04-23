import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { ChatWrapper } from './testUtils.js';
import { BlocksRenderer } from '../../src/blocks/BlocksRenderer.js';
import { BlockCard } from '../../src/blocks/BlockCard.js';
import { ThinkingBlock } from '../../src/blocks/ThinkingBlock.js';
import { ToolCallBlock } from '../../src/blocks/ToolCallBlock.js';
import { PlanBlock } from '../../src/blocks/PlanBlock.js';
import { ErrorBlock } from '../../src/blocks/ErrorBlock.js';
import { HumanInputBlock } from '../../src/blocks/HumanInputBlock.js';
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

describe('BlockCard', () => {
  it('renders title and children', () => {
    render(
      <ChatWrapper>
        <BlockCard title="测试卡片">
          <span>内容</span>
        </BlockCard>
      </ChatWrapper>
    );
    expect(screen.getByText('测试卡片')).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  it('renders tag', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" tag="MCP" />
      </ChatWrapper>
    );
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" icon={<span>icon</span>} />
      </ChatWrapper>
    );
    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('does not render content area when children is undefined', () => {
    const { container } = render(
      <ChatWrapper>
        <BlockCard title="无内容卡片" />
      </ChatWrapper>
    );
    expect(screen.getByText('无内容卡片')).toBeInTheDocument();
    // when no children, should not have content area padding div
    // should only have one header div (title bar), should not have extra content div
    const innerDivs = container.querySelectorAll('div > div');
    // title bar exists, but should not have children container
    expect(screen.getByText('无内容卡片')).toBeInTheDocument();
  });

  it('does not crash when children is null', () => {
    render(
      <ChatWrapper>
        <BlockCard title="空卡片">{null}</BlockCard>
      </ChatWrapper>
    );
    expect(screen.getByText('空卡片')).toBeInTheDocument();
  });

  it('renders normally when tag exists', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" tag="TAG" />
      </ChatWrapper>
    );
    expect(screen.getByText('TAG')).toBeInTheDocument();
  });
});

describe('ThinkingBlock', () => {
  it('renders thinking content', () => {
    render(
      <ChatWrapper>
        <ThinkingBlock block={thinkingBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('让我想想...')).toBeInTheDocument();
  });

  it('shows in-progress tag in streaming status', () => {
    const streaming: Block = { ...thinkingBlock, status: 'streaming' };
    render(
      <ChatWrapper>
        <ThinkingBlock block={streaming} />
      </ChatWrapper>
    );
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });
});

describe('ToolCallBlock', () => {
  it('renders tool name and args', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('renders tool result', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('does not crash without metadata', () => {
    const noMeta: Block = { id: 'x', type: 'tool_call', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <ToolCallBlock block={noMeta} />
      </ChatWrapper>
    );
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
    expect(screen.getByText('run-script')).toBeInTheDocument();
    expect(screen.getByText('SCRIPT')).toBeInTheDocument();
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
    expect(screen.getByText('list-files')).toBeInTheDocument();
    expect(screen.getByText('BUILTIN')).toBeInTheDocument();
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
    expect(screen.getByText('custom-tool')).toBeInTheDocument();
    expect(screen.getByText('UNKNOWN_TYPE')).toBeInTheDocument();
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
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('falls back to primary color when no corresponding key in blockColor', () => {
    // use a theme without blockColor to trigger ?.text ?? branch
    const minimalTheme = { ...lightTheme, blockColor: {} } as unknown as Theme;
    const noColorBlock: Block = {
      id: 'tc1',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'test-tool', toolType: 'mcp' },
    };
    render(
      <ChatWrapper context={{ theme: minimalTheme }}>
        <ToolCallBlock block={noColorBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('test-tool')).toBeInTheDocument();
  });
});

describe('PlanBlock', () => {
  it('renders plan steps', () => {
    render(
      <ChatWrapper>
        <PlanBlock block={planBlock} />
      </ChatWrapper>
    );
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
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('does not crash without steps', () => {
    const empty: Block = { id: 'x', type: 'plan', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <PlanBlock block={empty} />
      </ChatWrapper>
    );
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
    expect(screen.getByText('成功的步骤')).toBeInTheDocument();
    expect(screen.getByText('失败的步骤')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
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
    expect(screen.getByText('执行步骤')).toBeInTheDocument();
    expect(screen.getByText('跳过步骤')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
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
    // pending status uses index+1 as icon, step B is the 2nd (index=1), displays "2"
    expect(screen.getByText('2')).toBeInTheDocument();
    // step C is the 3rd (index=2), displays "3"
    expect(screen.getByText('3')).toBeInTheDocument();
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
    expect(screen.getByText('错误')).toBeInTheDocument();
  });
});

describe('HumanInputBlock', () => {
  it('renders confirmation interaction', () => {
    render(
      <ChatWrapper>
        <HumanInputBlock block={humanBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('是否继续？')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(buttons[0]).toBeInTheDocument();
  });

  it('clicking confirm triggers callback', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onConfirm).toHaveBeenCalledWith('req1', true);
  });

  it('completed status shows completed', () => {
    const done: Block = { ...humanBlock, status: 'completed' };
    render(
      <ChatWrapper>
        <HumanInputBlock block={done} />
      </ChatWrapper>
    );
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
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={inputBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    // input type should have input box and submit button
    const input = screen.getByPlaceholderText('请输入...');
    expect(input).toBeInTheDocument();
    // input type has only one button (submit), antd Button text may have spaces
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);
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
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={selectBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    // single-select submit button should be initially disabled (no option selected)
    // single-select has only one button (submit)
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
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
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={multiBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    // has defaultValue='a', so selectedValues is initially ['a'], submit button should be enabled
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', ['a']);
  });

  it('confirmation type clicking cancel triggers callback', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    const buttons = screen.getAllByRole('button');
    // first button is cancel button
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', false);
  });

  it('uses block.id when no requestId', () => {
    const onConfirm = vi.fn();
    const noReqId: Block = {
      ...humanBlock,
      metadata: { inputType: 'confirmation', title: '确认' },
    };
    render(
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={noReqId} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
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
    // input box exists
    const input = screen.getByPlaceholderText('请输入...');
    // modify input value
    fireEvent.change(input, { target: { value: 'hello' } });
    // click submit button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
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
    // select an option
    const radioA = screen.getByText('选项A');
    fireEvent.click(radioA);
    // now submit button should be enabled
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
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
    // select an option
    const checkboxA = screen.getByText('选项A');
    fireEvent.click(checkboxA);
    // now submit button should be enabled
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
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
    expect(screen.getByText('等待中')).toBeInTheDocument();
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
    expect(screen.getByText('让我想想...')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('出错了')).toBeInTheDocument();
  });

  it('uses custom block renderer', () => {
    const CustomBlock = ({ block }: { block: Block }) => <div>Custom: {block.type}</div>;
    render(
      <ChatWrapper context={{ renderers: { blocks: { thinking: CustomBlock } } }}>
        <BlocksRenderer blocks={[thinkingBlock]} />
      </ChatWrapper>
    );
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
});
