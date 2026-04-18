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
  it('渲染标题和 children', () => {
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

  it('渲染 tag', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" tag="MCP" />
      </ChatWrapper>
    );
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });

  it('渲染 icon', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" icon={<span>icon</span>} />
      </ChatWrapper>
    );
    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('children 为 undefined 时不渲染内容区域', () => {
    const { container } = render(
      <ChatWrapper>
        <BlockCard title="无内容卡片" />
      </ChatWrapper>
    );
    expect(screen.getByText('无内容卡片')).toBeInTheDocument();
    // 没有 children 时，不应有内容区域的 padding div
    // 只应有一个 header div（标题栏），不应有额外的内容 div
    const innerDivs = container.querySelectorAll('div > div');
    // 标题栏存在，但不应有 children 容器
    expect(screen.getByText('无内容卡片')).toBeInTheDocument();
  });

  it('children 为 null 时不崩溃', () => {
    render(
      <ChatWrapper>
        <BlockCard title="空卡片">{null}</BlockCard>
      </ChatWrapper>
    );
    expect(screen.getByText('空卡片')).toBeInTheDocument();
  });

  it('有 tag 时正常渲染', () => {
    render(
      <ChatWrapper>
        <BlockCard title="卡片" tag="TAG" />
      </ChatWrapper>
    );
    expect(screen.getByText('TAG')).toBeInTheDocument();
  });
});

describe('ThinkingBlock', () => {
  it('渲染思考内容', () => {
    render(
      <ChatWrapper>
        <ThinkingBlock block={thinkingBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('让我想想...')).toBeInTheDocument();
  });

  it('streaming 状态显示进行中标签', () => {
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
  it('渲染工具名称和参数', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();
  });

  it('渲染工具结果', () => {
    render(
      <ChatWrapper>
        <ToolCallBlock block={toolBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('无 metadata 时不崩溃', () => {
    const noMeta: Block = { id: 'x', type: 'tool_call', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <ToolCallBlock block={noMeta} />
      </ChatWrapper>
    );
    expect(screen.getByText('未知工具')).toBeInTheDocument();
  });

  it('toolType 为 script 时正常渲染', () => {
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

  it('toolType 为 builtin 时正常渲染', () => {
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

  it('toolType 为其他值时使用默认颜色', () => {
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

  it('error 状态时使用错误样式渲染结果', () => {
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

  it('有 args 但无 result 时渲染参数区域', () => {
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

  it('blockColor 中无对应 key 时 fallback 到 primary 颜色', () => {
    // 使用一个不包含 blockColor 的 theme 来触发 ?.text ?? 分支
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
  it('渲染计划步骤', () => {
    render(
      <ChatWrapper>
        <PlanBlock block={planBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('步骤二')).toBeInTheDocument();
    expect(screen.getByText('步骤三')).toBeInTheDocument();
  });

  it('显示完成进度标签', () => {
    render(
      <ChatWrapper>
        <PlanBlock block={planBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('无步骤时不崩溃', () => {
    const empty: Block = { id: 'x', type: 'plan', status: 'completed', content: '' };
    render(
      <ChatWrapper>
        <PlanBlock block={empty} />
      </ChatWrapper>
    );
    expect(screen.getByText('执行计划')).toBeInTheDocument();
  });

  it('渲染 error 状态步骤（显示 ✗ 图标）', () => {
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

  it('渲染 skipped 状态步骤（显示 — 图标和删除线样式）', () => {
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

  it('渲染 pending 状态步骤（显示序号）', () => {
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
    // pending 状态使用 index+1 作为图标，步骤B 是第2个（index=1），显示 "2"
    expect(screen.getByText('2')).toBeInTheDocument();
    // 步骤C 是第3个（index=2），显示 "3"
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });
});

describe('ErrorBlock', () => {
  it('渲染错误内容和错误码', () => {
    render(
      <ChatWrapper>
        <ErrorBlock block={errorBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('ERR_001')).toBeInTheDocument();
  });

  it('无 errorCode 时不显示 tag', () => {
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
  it('渲染确认交互', () => {
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

  it('点击确认触发回调', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', true);
  });

  it('已完成状态显示已完成', () => {
    const done: Block = { ...humanBlock, status: 'completed' };
    render(
      <ChatWrapper>
        <HumanInputBlock block={done} />
      </ChatWrapper>
    );
    expect(screen.getByText('已回复')).toBeInTheDocument();
  });

  it('input 类型渲染输入框', () => {
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

  it('single-select 类型渲染选项', () => {
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

  it('multi-select 类型渲染选项', () => {
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

  it('input 类型点击提交按钮触发回调', () => {
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
    // input 类型应该有输入框和提交按钮
    const input = screen.getByPlaceholderText('请输入...');
    expect(input).toBeInTheDocument();
    // input 类型只有一个按钮（提交），antd Button 文本会带空格
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', '默认值');
  });

  it('single-select 类型未选择时提交按钮为 disabled', () => {
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
    // 单选的提交按钮初始应该是 disabled（未选择任何选项）
    // single-select 只有一个按钮（提交）
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('multi-select 类型带默认值时点击提交按钮触发回调', () => {
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
    // 有 defaultValue='a'，所以 selectedValues 初始为 ['a']，提交按钮应该可用
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', ['a']);
  });

  it('confirmation 类型点击取消触发回调', () => {
    const onConfirm = vi.fn();
    render(
      <ChatWrapper context={{ onConfirmHumanRequest: onConfirm }}>
        <HumanInputBlock block={humanBlock} onConfirm={onConfirm} />
      </ChatWrapper>
    );
    const buttons = screen.getAllByRole('button');
    // 第二个按钮是取消按钮
    fireEvent.click(buttons[1]);
    expect(onConfirm).toHaveBeenCalledWith('req1', false);
  });

  it('无 requestId 时使用 block.id', () => {
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
    fireEvent.click(buttons[0]);
    // requestId 应该 fallback 为 block.id
    expect(onConfirm).toHaveBeenCalledWith('b5', true);
  });

  it('无 metadata 时使用默认值', () => {
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
    // inputType 默认为 'confirmation'，title 默认为 '需要确认'
    expect(screen.getByText('需要确认')).toBeInTheDocument();
    expect(screen.getByText('等待中')).toBeInTheDocument();
  });

  it('input 类型输入值并提交', () => {
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
    // 输入框存在
    const input = screen.getByPlaceholderText('请输入...');
    // 修改输入值
    fireEvent.change(input, { target: { value: 'hello' } });
    // 点击提交按钮
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', 'hello');
  });

  it('single-select 类型选择后提交触发回调', () => {
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
    // 选择一个选项
    const radioA = screen.getByText('选项A');
    fireEvent.click(radioA);
    // 现在提交按钮应该可用
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', 'a');
  });

  it('multi-select 类型选择后提交触发回调', () => {
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
    // 选择一个选项
    const checkboxA = screen.getByText('选项A');
    fireEvent.click(checkboxA);
    // 现在提交按钮应该可用
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    fireEvent.click(buttons[0]);
    expect(onConfirm).toHaveBeenCalledWith('req1', ['a']);
  });

  it('streaming 状态也视为 pending', () => {
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
  it('渲染多种 block 类型', () => {
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

  it('使用自定义 block 渲染器', () => {
    const CustomBlock = ({ block }: { block: Block }) => <div>Custom: {block.type}</div>;
    render(
      <ChatWrapper context={{ renderers: { blocks: { thinking: CustomBlock } } }}>
        <BlocksRenderer blocks={[thinkingBlock]} />
      </ChatWrapper>
    );
    expect(screen.getByText('Custom: thinking')).toBeInTheDocument();
  });

  it('未知 block 类型跳过渲染', () => {
    const unknown: Block = { id: 'x', type: 'unknown_type', status: 'completed', content: '...' };
    const { container } = render(
      <ChatWrapper>
        <BlocksRenderer blocks={[unknown]} />
      </ChatWrapper>
    );
    // 应该只有容器 div，没有 block 内容
    expect(container.textContent).toBe('');
  });
});
