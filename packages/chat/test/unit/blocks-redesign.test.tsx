/**
 * Blocks-redesign coverage: TodoBlock / ShellBlock / SubAgentBlock /
 * SubAgentModal — previously 978 lines with zero tests (routed from
 * BlocksRenderer). Asserts user-visible contracts: text, status labels,
 * collapse behavior, ANSI cleaning, modal open/close.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWrapper, expandAllCollapsed } from './testUtils.js';
import { BlocksRenderer } from '../../src/blocks-redesign/BlocksRenderer.js';
import { SubAgentModal } from '../../src/blocks-redesign/SubAgentModal.js';
import type { Block, Message } from '../../src/types.js';

/// 经 BlocksRenderer 渲染单块(走真实路由,顺带覆盖路由正确性)
function renderBlock(block: Block) {
  return render(
    <ChatWrapper>
      <BlocksRenderer blocks={[block]} />
    </ChatWrapper>
  );
}

// ── TodoBlock ───────────────────────────────────────────────────────────────

describe('TodoBlock', () => {
  const todoBlock = (items: Block['metadata'], status: Block['status'] = 'completed'): Block => ({
    id: 'b1',
    type: 'todo',
    status,
    content: '',
    metadata: { title: '会话任务', items: items as never },
  });

  it('renders title, item texts and done-count', () => {
    renderBlock(
      todoBlock([
        { content: '搜索资料', status: 'completed' },
        { content: '写报告', status: 'in_progress' },
        { content: '复查', status: 'pending' },
      ])
    );
    expect(screen.getByText('会话任务')).toBeInTheDocument();
    expect(screen.getByText('搜索资料')).toBeInTheDocument();
    expect(screen.getByText('写报告')).toBeInTheDocument();
    expect(screen.getByText('复查')).toBeInTheDocument();
    // 计数 1/3(精确文本,而非存在性)
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('renders wire-shaped items (subject) — daemon 真实数据形状', () => {
    renderBlock(
      todoBlock([
        { id: 1, subject: '搜索资料', status: 'completed' },
        { id: 2, subject: '写报告', status: 'in_progress' },
      ])
    );
    expect(screen.getByText('搜索资料')).toBeInTheDocument();
    expect(screen.getByText('写报告')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('collapses to summary line when all items are completed, expands on click', () => {
    renderBlock(todoBlock([{ content: '唯一任务', status: 'completed' }]));
    // 全完成:折叠成摘要行,列表项不可见
    expect(screen.getByText('全部完成 1/1')).toBeInTheDocument();
    expect(screen.queryByText('唯一任务')).not.toBeInTheDocument();
    // 点标题栏展开
    fireEvent.click(screen.getByText('全部完成 1/1'));
    expect(screen.getByText('唯一任务')).toBeInTheDocument();
  });

  it('stays expanded while items are in progress', () => {
    renderBlock(
      todoBlock([
        { content: '进行中任务', status: 'in_progress' },
        { content: '待办', status: 'pending' },
      ])
    );
    expect(screen.getByText('进行中任务')).toBeInTheDocument();
    expect(screen.getByText('待办')).toBeInTheDocument();
    expect(screen.getByText('0/2')).toBeInTheDocument();
  });

  it('renders gracefully without metadata (negative path)', () => {
    renderBlock({ id: 'b1', type: 'todo', status: 'completed', content: '' });
    // 标题回退默认文案,不崩溃,计数 0/0
    expect(screen.getByText('任务清单')).toBeInTheDocument();
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});

// ── ShellBlock ──────────────────────────────────────────────────────────────

describe('ShellBlock', () => {
  it('renders command and output text (collapsed when done, expands on header click)', () => {
    renderBlock({
      id: 'b2',
      type: 'shell',
      status: 'completed',
      content: '',
      metadata: { command: 'ls -la', output: 'file1.txt\nfile2.txt', exitCode: 0 },
    });
    expect(screen.getByText('ls -la')).toBeInTheDocument();
    // 完成态默认折叠:输出不可见
    expect(screen.queryByText(/file1\.txt/)).not.toBeInTheDocument();
    // 点标题栏(aria-expanded 头)展开
    fireEvent.click(document.querySelector('[aria-expanded="false"]') as HTMLElement);
    expect(screen.getByText(/file1\.txt/)).toBeInTheDocument();
    expect(screen.getByText(/file2\.txt/)).toBeInTheDocument();
  });

  it('strips ANSI escape sequences from output', () => {
    renderBlock({
      id: 'b3',
      type: 'shell',
      status: 'completed',
      content: '',
      metadata: {
        command: 'echo',
        // 模拟彩色终端输出:ESC[31m…ESC[0m + 裸 \r 回车
        output: '\u001b[31m红色文本\u001b[0m\r第二行',
        exitCode: 0,
      },
    });
    fireEvent.click(document.querySelector('[aria-expanded="false"]') as HTMLElement);
    expect(screen.getByText(/红色文本/)).toBeInTheDocument();
    expect(screen.getByText(/第二行/)).toBeInTheDocument();
    // 转义序列不应出现在可见文本里
    expect(document.body.textContent).not.toContain('\u001b');
    expect(document.body.textContent).not.toContain('[31m');
  });

  it('shows running state without exit code', () => {
    renderBlock({
      id: 'b4',
      type: 'shell',
      status: 'streaming',
      content: '',
      metadata: { command: 'sleep 10', output: '' },
    });
    expect(screen.getByText('sleep 10')).toBeInTheDocument();
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('renders gracefully without metadata (negative path)', () => {
    renderBlock({ id: 'b5', type: 'shell', status: 'completed', content: '' });
    expect(screen.getByText('终端')).toBeInTheDocument();
  });

  it('routes tool_call(shell) through the terminal block (adapter)', () => {
    // state reducer 只产通用 tool_call;渲染层按 toolName=shell 适配到
    // 专用终端块——命令取 args.command,输出取 toolResult,exitCode 解析。
    renderBlock({
      id: 'b6',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'shell',
        toolArgs: JSON.stringify({ command: 'pwd' }),
        toolResult: 'Exit code: 1\nSTDERR:\nnope',
      },
    });
    expect(screen.getByText('pwd')).toBeInTheDocument();
    // 非零退出码:块保持展开,输出直接可见
    expect(screen.getByText(/Exit code: 1/)).toBeInTheDocument();
    expect(screen.getByText(/nope/)).toBeInTheDocument();
  });

  it('keeps generic tool_call rendering for other tools', () => {
    renderBlock({
      id: 'b7',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'file_read', toolArgs: '{"path":"a.md"}' },
    });
    expect(screen.queryByText('终端')).not.toBeInTheDocument();
  });
});

// ── FileEditBlock ───────────────────────────────────────────────────────────

describe('FileEditBlock', () => {
  /** tool_call(file_edit) 块工厂:args 必填,回执可选 */
  const editCall = (
    status: Block['status'],
    toolArgs: Record<string, unknown>,
    toolResult?: string
  ): Block => ({
    id: 'fe1',
    type: 'tool_call',
    status,
    content: '',
    metadata: {
      toolName: 'file_edit',
      toolArgs: JSON.stringify(toolArgs),
      ...(toolResult !== undefined ? { toolResult } : {}),
    },
  });

  it('adapts tool_call(file_edit) to a diff block: collapsed on success, expands on click', () => {
    renderBlock(
      editCall(
        'completed',
        { filePath: 'src/app.ts', oldString: 'const a = old;\n', newString: 'const a = new;\n' },
        'Edited src/app.ts: Successfully replaced 1 occurrence\nUpdated region:\n10→const a = new;'
      )
    );
    // 成功后折叠:头部摘要可见,diff 行不可见
    expect(screen.getByText('文件编辑')).toBeInTheDocument();
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(screen.queryByText('const a = old;')).not.toBeInTheDocument();
    // 点标题栏展开:diff 行 + 统计徽标 + 行号出现
    fireEvent.click(document.querySelector('[aria-expanded="false"]') as HTMLElement);
    expect(screen.getByText('const a = old;')).toBeInTheDocument();
    expect(screen.getByText('const a = new;')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('stays expanded while running: diff visible without line numbers, running badge', () => {
    renderBlock(
      editCall('streaming', {
        filePath: 'src/app.ts',
        oldString: 'const a = old;\n',
        newString: 'const a = new;\n',
      })
    );
    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.getByText('const a = old;')).toBeInTheDocument();
    expect(screen.getByText('const a = new;')).toBeInTheDocument();
    // 回执未到:startLine 未知,行号槽整体隐藏
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('shows the guard rejection message when the receipt starts with Error:', () => {
    renderBlock(
      editCall(
        'completed',
        { filePath: 'a.txt', oldString: 'x', newString: 'y' },
        'Error: "x" not found in file. Check for invisible whitespace'
      )
    );
    // 被拒:保持展开,错误文案直接可见,无统计徽标
    expect(screen.getByText(/not found in file/)).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('shows the ×N badge for replace_all edits hitting multiple sites', () => {
    renderBlock(
      editCall(
        'completed',
        {
          filePath: 'a.txt',
          oldString: 'let x = 1;\n',
          newString: 'let x = 2;\n',
          replaceAll: true,
        },
        'Edited a.txt: Successfully replaced 3 occurrences\nUpdated region:\n42→let x = 2;'
      )
    );
    fireEvent.click(document.querySelector('[aria-expanded="false"]') as HTMLElement);
    expect(screen.getByText('×3')).toBeInTheDocument();
    expect(screen.getAllByText('42').length).toBe(2);
  });

  it('falls back to generic tool_call rendering when args are corrupted', () => {
    renderBlock({
      id: 'fe2',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: { toolName: 'file_edit', toolArgs: '{not-json', toolResult: 'Error: bad' },
    });
    expect(screen.queryByText('文件编辑')).not.toBeInTheDocument();
    expect(screen.getByText('file_edit')).toBeInTheDocument();
  });

  it('renders a direct file_edit block without args: header only, replaceAll badge', () => {
    // 直构 file_edit 块(如 stories/自定义渲染):无 args 不构建 diff 行;
    // replaceAll 单次替换且次数未知时显示 replaceAll 徽标
    renderBlock({
      id: 'fe3',
      type: 'file_edit',
      status: 'completed',
      content: '',
      metadata: { filePath: 'notes.md', replaceAll: true },
    });
    expect(screen.getByText('文件编辑')).toBeInTheDocument();
    expect(screen.getByText('replaceAll')).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });
});

// ── SubAgentBlock ───────────────────────────────────────────────────────────

describe('SubAgentBlock', () => {
  const subBlock = (status: Block['status'], metadata: Block['metadata']): Block => ({
    id: 'b6',
    type: 'subagent',
    status,
    content: '子智能体的流式输出内容',
    metadata,
  });

  it('renders name, task and streaming label while running', () => {
    renderBlock(subBlock('streaming', { name: 'searcher', task: '查找资料' }));
    expect(screen.getByText('searcher')).toBeInTheDocument();
    expect(screen.getByText('查找资料')).toBeInTheDocument();
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('completed block defaults collapsed, expands to stats on header click', () => {
    renderBlock(
      subBlock('completed', {
        name: 'writer',
        task: '写摘要',
        resultStatus: 'completed',
        steps: 3,
        inputTokens: 100,
        outputTokens: 20,
      })
    );
    expect(screen.getByText('writer')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    // 完成态默认折叠:统计行不可见
    expect(screen.queryByText('3 步')).not.toBeInTheDocument();
    // 点标题栏(aria-expanded 头,非名字——名字点击打开详情模态)展开
    fireEvent.click(document.querySelector('[aria-expanded="false"]') as HTMLElement);
    // 判别性由上一行的折叠前不可见保证;展开后摘要行与统计行各出现一份
    expect(screen.getAllByText('3 步').length).toBeGreaterThan(0);
    expect(screen.getAllByText('↑100 ↓20 tok').length).toBeGreaterThan(0);
  });

  it.each([
    ['error', undefined, '错误'],
    ['completed', { resultStatus: 'timeout' }, '超时'],
    ['completed', { resultStatus: 'max_steps' }, '达到上限'],
    ['completed', { resultStatus: 'abort' }, '已中止'],
  ] as const)('status %s + resultStatus %s shows label %s', (status, meta, label) => {
    renderBlock(subBlock(status, { name: 'a', task: 't', ...meta }));
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('opens the detail modal when the row is clicked', async () => {
    const messages: Message[] = [
      { id: 'm1', role: 'user', content: '子任务指令', status: 'completed' },
    ];
    renderBlock(subBlock('streaming', { name: 'searcher', task: '查找资料', messages }));
    // 行点击打开懒加载的 SubAgentModal
    fireEvent.click(screen.getByText('searcher'));
    await waitFor(() => {
      expect(screen.getByText('子任务指令')).toBeInTheDocument();
    });
  });
});

// ── SubAgentModal ───────────────────────────────────────────────────────────

describe('SubAgentModal', () => {
  const messages: Message[] = [
    { id: 'm1', role: 'user', content: '问题内容', status: 'completed' },
    { id: 'm2', role: 'assistant', content: '回答内容', status: 'completed' },
  ];

  it('renders message list content when open', () => {
    render(
      <ChatWrapper>
        <SubAgentModal open={true} onClose={() => {}} messages={messages} />
      </ChatWrapper>
    );
    expect(screen.getByText('问题内容')).toBeInTheDocument();
    expect(screen.getByText('回答内容')).toBeInTheDocument();
  });

  it('shows the empty hint when there are no messages (negative path)', () => {
    render(
      <ChatWrapper>
        <SubAgentModal open={true} onClose={() => {}} messages={[]} />
      </ChatWrapper>
    );
    expect(screen.getByText('无对话记录')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <ChatWrapper>
        <SubAgentModal open={false} onClose={() => {}} messages={messages} />
      </ChatWrapper>
    );
    expect(screen.queryByText('问题内容')).not.toBeInTheDocument();
  });
});
