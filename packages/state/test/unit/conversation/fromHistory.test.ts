/**
 * @fileoverview fromHistory unit tests — colts Message[] → SessionRunState
 */
import { describe, it, expect } from 'vitest';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import { selectMainMessages } from '../../../src/core/conversation/selectors.js';
import type { ColtsMessageInput } from '../../../src/core/types.js';

describe('fromHistory', () => {
  it('reconstructs user + assistant messages', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'Hello', timestamp: 1000 },
      { role: 'assistant', content: 'Hi there!', type: 'action', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Hello');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toBe('Hi there!');
  });

  it('reconstructs thinking blocks from thought messages', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'assistant', content: 'Let me think about this.', type: 'thought', timestamp: 1000 },
      { role: 'assistant', content: 'The answer is 42.', type: 'action', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    // The thought should be attached as a thinking block
    const assistantMsg = msgs.find((m) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    const thinkingBlock = assistantMsg!.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock).toBeDefined();
    expect(thinkingBlock!.content).toBe('Let me think about this.');
    expect(thinkingBlock!.status).toBe('completed');
  });

  it('reconstructs tool_call blocks with results', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call-1', name: 'file_read', arguments: { path: '/test.ts' } }],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'export const x = 1;',
        toolCallId: 'call-1',
        toolName: 'file_read',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const toolBlock = msgs[0].blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock).toBeDefined();
    expect(toolBlock!.metadata?.toolName).toBe('file_read');
    expect(toolBlock!.metadata?.toolResult).toBe('export const x = 1;');
    expect(toolBlock!.status).toBe('completed');
  });

  it('forwards optional toolType from history toolCalls into metadata', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          { id: 'call-1', name: 'fs__read', arguments: {}, toolType: 'mcp' },
          { id: 'call-2', name: 'web_fetch', arguments: { url: 'https://x' } },
        ],
        timestamp: 1000,
      },
      { role: 'tool', content: 'a', toolCallId: 'call-1', toolName: 'fs__read', timestamp: 2000 },
      { role: 'tool', content: 'b', toolCallId: 'call-2', toolName: 'web_fetch', timestamp: 3000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const blocks = msgs[0].blocks?.filter((b) => b.type === 'tool_call');
    expect(blocks?.[0].metadata?.toolType).toBe('mcp');
    // 未携带时不写入,保持旧形状
    expect(blocks?.[1].metadata).not.toHaveProperty('toolType');
  });

  it('restores todoList snapshot and synthesizes one completed todo block', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'plan please', timestamp: 1000 },
      { role: 'assistant', content: 'on it', type: 'action', timestamp: 2000 },
    ];
    const todoList = {
      items: [
        { id: 1, subject: 'draft', status: 'completed' as const },
        { id: 2, subject: 'review', status: 'pending' as const },
      ],
    };
    const state = fromHistory(messages, { todoList });
    // 快照恢复(侧栏数据源)
    expect(state.main.todoList?.items).toHaveLength(2);
    // 合成单个 completed 块,挂到最后一条 assistant 消息
    const msgs = selectMainMessages(state);
    const lastAssistant = [...msgs].reverse().find((m) => m.role === 'assistant')!;
    const todoBlocks = lastAssistant.blocks?.filter((b) => b.type === 'todo');
    expect(todoBlocks).toHaveLength(1);
    expect(todoBlocks![0].status).toBe('completed');
    const items = todoBlocks![0].metadata?.items as Array<{ subject: string }>;
    expect(items[1].subject).toBe('review');
  });

  it('without extras no todo block is synthesized (legacy archives)', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'hello', type: 'action', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    expect(state.main.todoList).toBeUndefined();
    const msgs = selectMainMessages(state);
    expect(msgs.flatMap((m) => m.blocks?.filter((b) => b.type === 'todo') ?? [])).toHaveLength(0);
  });

  it('reconstructs skill blocks from load_skill tool calls', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          { id: 'call-s1', name: 'load_skill', arguments: { name: 'poet', task: 'write a haiku' } },
        ],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'You are a poet.',
        toolCallId: 'call-s1',
        toolName: 'load_skill',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const skillBlock = msgs[0].blocks?.find((b) => b.type === 'skill');
    expect(skillBlock).toBeDefined();
    expect(skillBlock!.status).toBe('completed');
    expect(skillBlock!.metadata?.skillName).toBe('poet');
    expect(skillBlock!.metadata?.task).toBe('write a haiku');
    expect(skillBlock!.metadata?.result).toBe('You are a poet.');
  });

  it('skills injected skill-directive user rows: no bubble, no turn break', () => {
    // 引擎在 load_skill 成功后注入 type='skill-directive' 的 user 行驱动
    // 下一轮。历史重建必须跳过它:既不渲染成用户气泡(用户没说过这句
    // 话),也不切断助手回合 —— skill 块与后续内容留在同一 assistant
    // 气泡里,与 live 渲染同构。
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: '帮我写首诗', timestamp: 0 },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call-s1', name: 'load_skill', arguments: { name: 'poet' } }],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'You are a poet.',
        toolCallId: 'call-s1',
        toolName: 'load_skill',
        timestamp: 2000,
      },
      {
        role: 'user',
        content: 'Follow the loaded skill instructions to complete the user request.',
        type: 'skill-directive',
        timestamp: 3000,
      },
      { role: 'assistant', content: '好的,按手册来。', timestamp: 4000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    // 真实用户消息 + 一个 assistant 气泡,directive 行不产生任何消息。
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('帮我写首诗');
    expect(msgs[1].role).toBe('assistant');
    // skill 块与后续文本同气泡。
    const types = msgs[1].blocks?.map((b) => b.type);
    expect(types).toContain('skill');
    expect(msgs[1].content).toBe('好的,按手册来。');
    expect(
      msgs.some((m) => m.role === 'user' && m.content.includes('Follow the loaded skill'))
    ).toBe(false);
  });

  it('reconstructs human_input blocks from ask_human tool calls', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-h1',
            name: 'ask_human',
            arguments: {
              context: '需要确认',
              questions: [{ id: 'q1', question: '继续吗？', type: 'input' }],
            },
          },
        ],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'yes',
        toolCallId: 'call-h1',
        toolName: 'ask_human',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const humanBlock = msgs[0].blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock).toBeDefined();
    expect(humanBlock!.metadata?.message).toBe('继续吗？');
    expect(humanBlock!.metadata?.response).toBe('yes');
  });

  it('reconstructs subagent blocks + sub-agent summary from delegate tool calls', () => {
    const delegateResult = {
      status: 'success',
      answer: 'Research complete.',
      totalSteps: 3,
      tokens: { input: 500, output: 200, cacheRead: 0, cacheWrite: 0 },
      duration: 10000,
    };
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-d1',
            name: 'delegate',
            arguments: { agent: 'researcher', task: 'find papers' },
          },
        ],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: JSON.stringify(delegateResult),
        toolCallId: 'call-d1',
        toolName: 'delegate',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);

    // Check subagent block on main message
    const msgs = selectMainMessages(state);
    const subBlock = msgs[0].blocks?.find((b) => b.type === 'subagent');
    expect(subBlock).toBeDefined();
    expect(subBlock!.metadata?.name).toBe('researcher');
    expect(subBlock!.metadata?.resultStatus).toBe('success');
    expect(subBlock!.metadata?.steps).toBe(3);
    // Flat token fields (SubAgentBlockMetadata shape) + messages for the modal
    expect(subBlock!.metadata?.inputTokens).toBe(500);
    expect(subBlock!.metadata?.outputTokens).toBe(200);
    expect(subBlock!.metadata?.messages).toHaveLength(2);

    // Check sub-agent state
    const subtaskId = subBlock!.metadata?.subtaskId as string;
    const sub = state.subAgents.get(subtaskId);
    expect(sub).toBeDefined();
    expect(sub!.name).toBe('researcher');
    expect(sub!.totalSteps).toBe(3);
    expect(sub!.tokens.input).toBe(500);

    // Sub-agent has task + answer as messages
    const subMsgs = sub!.messages;
    expect(subMsgs[0].role).toBe('user');
    expect(subMsgs[0].content).toBe('find papers');
    const answerMsg = subMsgs.find((m) => m.role === 'assistant');
    expect(answerMsg).toBeDefined();
    expect(answerMsg!.content).toBe('Research complete.');
  });
});

describe('fromHistory — boundary cases', () => {
  it('handles empty message array', () => {
    const state = fromHistory([]);
    expect(state.main.messages).toHaveLength(0);
    expect(state.subAgents.size).toBe(0);
    expect(state.main.status).toBe('idle');
  });

  it('handles delegate tool result that is non-JSON string', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'd1', name: 'delegate', arguments: { agent: 'worker', task: 'do it' } }],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'plain text result not json',
        toolCallId: 'd1',
        toolName: 'delegate',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const subBlock = msgs[0].blocks?.find((b) => b.type === 'subagent');
    expect(subBlock).toBeDefined();
    // Non-JSON → parseDelegateResult catches, status='success', answer=raw text
    expect(subBlock!.metadata?.resultStatus).toBe('success');
  });

  it('handles delegate result missing tokens/duration (fallback to zero)', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'd2', name: 'delegate', arguments: { agent: 'worker', task: 'task' } }],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: JSON.stringify({ status: 'success', answer: 'done', totalSteps: 1 }),
        // Note: no tokens or duration fields
        toolCallId: 'd2',
        toolName: 'delegate',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const subBlock = state.main.messages[0].blocks?.find((b) => b.type === 'subagent');
    const subtaskId = subBlock!.metadata?.subtaskId as string;
    const sub = state.subAgents.get(subtaskId);
    expect(sub).toBeDefined();
    // Missing tokens/duration should fallback to zero values
    expect(sub!.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(sub!.duration).toBe(0);
  });

  it('skips assistant messages with no toolCalls and no content', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'Hello', timestamp: 1000 },
      { role: 'assistant', content: '', timestamp: 2000 }, // empty assistant
      { role: 'assistant', content: 'Real reply', type: 'action', timestamp: 3000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    // The empty assistant message should be skipped
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toBe('Real reply');
  });

  it('reconstructs system messages', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'system', content: 'System instructions', timestamp: 1000 },
      { role: 'user', content: 'Hello', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toBe('System instructions');
  });

  // ── Branch coverage ──

  it('creates wrapper message when thought has no preceding assistant message', () => {
    // Thought without a prior completed assistant msg → else branch (line 75)
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'thinking...', type: 'thought', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    // Should create a wrapper assistant message with thinking block
    const wrapper = msgs.find(
      (m) => m.role === 'assistant' && m.blocks?.some((b) => b.type === 'thinking')
    );
    expect(wrapper).toBeDefined();
    expect(wrapper!.content).toBe('');
  });

  it('attaches thinking to existing assistant message that already has blocks (?? [] branch)', () => {
    // First a thought → creates wrapper. Then another thought → attaches to existing (blocks ?? [])
    const messages: ColtsMessageInput[] = [
      { role: 'assistant', content: 'first thought', type: 'thought', timestamp: 1000 },
      { role: 'assistant', content: 'second thought', type: 'thought', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const assistantMsg = msgs.find((m) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    // Should have 2 thinking blocks
    const thinkingBlocks = assistantMsg!.blocks?.filter((b) => b.type === 'thinking');
    expect(thinkingBlocks).toHaveLength(2);
  });

  it('handles delegate result without answer (ternary false branch)', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-del',
            name: 'delegate',
            arguments: { agent: 'coder', task: 'do something' },
          },
        ],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: JSON.stringify({ status: 'success', totalSteps: 2 }),
        toolCallId: 'call-del',
        toolName: 'delegate',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    // Should create subagent block + sub-agent state without answer message
    const subAgents = state.subAgents;
    expect(subAgents.size).toBe(1);
    const sub = subAgents.get('hist-call-del');
    expect(sub).toBeDefined();
    // No answer → only task message, no answer message
    expect(sub!.messages).toHaveLength(1);
    expect(sub!.messages[0].role).toBe('user');
  });

  it('handles assistant message with content but no tool calls', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'just text', type: 'action', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const assistant = msgs.find((m) => m.role === 'assistant');
    expect(assistant).toBeDefined();
    expect(assistant!.content).toBe('just text');
  });

  it('skips empty assistant message (no content, no toolCalls)', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: '', type: 'action', timestamp: 2000 },
      { role: 'assistant', content: 'real reply', type: 'action', timestamp: 3000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    // Empty assistant should be skipped
    const assistants = msgs.filter((m) => m.role === 'assistant');
    expect(assistants).toHaveLength(1);
    expect(assistants[0].content).toBe('real reply');
  });

  it('handles tool message with missing toolCallId pairing', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'tool', content: 'orphan', toolCallId: 'nonexistent', timestamp: 1000 },
    ];
    const state = fromHistory(messages);
    // Should not crash, orphan tool message is skipped
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(0);
  });

  it('handles human_input tool with no questions array', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-human',
            name: 'ask_human',
            arguments: { context: 'Need input' },
          },
        ],
        timestamp: 1000,
      },
      {
        role: 'tool',
        content: 'user response',
        toolCallId: 'call-human',
        toolName: 'ask_human',
        timestamp: 2000,
      },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const humanBlock = msgs[0].blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock).toBeDefined();
    // questions defaults to [] → message is empty string
    expect(humanBlock!.metadata?.message).toBe('');
  });
});

describe('fromHistory — turn-level bubble merging', () => {
  /**
   * The persistence layer stores one row per LLM call (protocol-mandated:
   * assistant-with-toolCalls → tool result → next assistant), so a
   * tool-using turn arrives as MULTIPLE rows. The reconstructed view must
   * merge them back into ONE assistant bubble — matching the live reducer,
   * which merges a whole run into a single streaming message.
   */
  it('merges a tool-calling turn (action + tool + text) into ONE assistant bubble', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: '',
        type: 'action',
        toolCalls: [{ id: 'call-1', name: 'shell', arguments: { cmd: 'ls' } }],
        timestamp: 2000,
      },
      {
        role: 'tool',
        content: 'file list',
        toolCallId: 'call-1',
        toolName: 'shell',
        timestamp: 3000,
      },
      { role: 'assistant', content: 'final answer', type: 'text', timestamp: 4000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2); // user + ONE assistant bubble
    const assistant = msgs[1];
    expect(assistant.role).toBe('assistant');
    expect(assistant.content).toBe('final answer');
    // Tool block first (from the action row), then the closing text block —
    // blocks carry the chronological order; content is their concatenation.
    expect(assistant.blocks?.map((b) => b.type)).toEqual(['tool_call', 'text']);
    expect(assistant.blocks![0]).toMatchObject({
      type: 'tool_call',
      metadata: { toolName: 'shell', toolResult: 'file list' },
    });
    expect(assistant.blocks![1]).toMatchObject({ type: 'text', content: 'final answer' });
  });

  it('merges thought + action + text into one bubble with thinking + tool blocks', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'Let me think', type: 'thought', timestamp: 2000 },
      {
        role: 'assistant',
        content: '',
        type: 'action',
        toolCalls: [{ id: 'call-1', name: 'shell', arguments: { cmd: 'ls' } }],
        timestamp: 3000,
      },
      { role: 'tool', content: 'ok', toolCallId: 'call-1', toolName: 'shell', timestamp: 4000 },
      { role: 'assistant', content: 'done', type: 'text', timestamp: 5000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2);
    const assistant = msgs[1];
    expect(assistant.content).toBe('done');
    const blockTypes = assistant.blocks?.map((b) => b.type) ?? [];
    expect(blockTypes).toEqual(['thinking', 'tool_call', 'text']);
  });

  it('keeps separate turns in separate bubbles', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'q1', timestamp: 1000 },
      { role: 'assistant', content: 'a1', type: 'text', timestamp: 2000 },
      { role: 'user', content: 'q2', timestamp: 3000 },
      { role: 'assistant', content: 'a2', type: 'text', timestamp: 4000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    expect(msgs[1].content).toBe('a1');
    expect(msgs[3].content).toBe('a2');
  });

  it('merges consecutive text rows of one turn (multi-LLM-call turn)', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'First note', type: 'text', timestamp: 2000 },
      { role: 'assistant', content: 'Second note', type: 'text', timestamp: 3000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2);
    expect(msgs[1].content).toBe('First noteSecond note');
  });

  it('concatenates text that follows a tool call in the same turn', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: '',
        type: 'action',
        toolCalls: [{ id: 'c1', name: 'file_read', arguments: { path: 'a' } }],
        timestamp: 2000,
      },
      { role: 'tool', content: '42', toolCallId: 'c1', toolName: 'file_read', timestamp: 3000 },
      { role: 'assistant', content: 'The value is 42', type: 'text', timestamp: 4000 },
      { role: 'assistant', content: ' Does that help?', type: 'text', timestamp: 5000 },
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    expect(msgs).toHaveLength(2);
    const assistant = msgs[1];
    // Each trailing text row becomes its own text block, in order.
    expect(assistant.blocks?.map((b) => b.type)).toEqual(['tool_call', 'text', 'text']);
    expect(assistant.blocks![1].content).toBe('The value is 42');
    expect(assistant.blocks![2].content).toBe(' Does that help?');
    expect(assistant.content).toBe('The value is 42 Does that help?');
  });

  /**
   * Regression: thinking blocks used to be PREPENDED to the bubble, so a
   * resumed conversation rendered every thought at the top in reverse
   * order — never matching the live view. Blocks must append in storage
   * order, making resume block-for-block identical to the live reducer.
   */
  it('preserves interleaved order: thought → text+tool → thought → text', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: '思考A', type: 'thought', timestamp: 2000 },
      {
        role: 'assistant',
        content: '我先查一下',
        type: 'action',
        toolCalls: [{ id: 'c1', name: 'search', arguments: { q: 'x' } }],
        timestamp: 3000,
      },
      { role: 'tool', content: 'result', toolCallId: 'c1', toolName: 'search', timestamp: 4000 },
      { role: 'assistant', content: '思考B', type: 'thought', timestamp: 5000 },
      { role: 'assistant', content: '结论如下', type: 'text', timestamp: 6000 },
    ];
    const state = fromHistory(messages);
    const assistant = selectMainMessages(state)[1];
    expect(assistant.blocks?.map((b) => b.type)).toEqual([
      'thinking',
      'text',
      'tool_call',
      'thinking',
      'text',
    ]);
    expect(assistant.blocks?.map((b) => b.content)).toEqual([
      '思考A',
      '我先查一下',
      '',
      '思考B',
      '结论如下',
    ]);
    // Derived content stays the concatenation of the text blocks.
    expect(assistant.content).toBe('我先查一下结论如下');
  });

  it('keeps prose ahead of tool calls within a single action row', () => {
    // One completion emitted both text and toolCalls: the persisted action
    // row holds both. Live SSE streams the tokens before tool-start, so the
    // reconstructed text block must precede the tool block too.
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'let me look',
        type: 'action',
        toolCalls: [{ id: 'c1', name: 'file_read', arguments: { path: 'a' } }],
        timestamp: 2000,
      },
      { role: 'tool', content: 'data', toolCallId: 'c1', toolName: 'file_read', timestamp: 3000 },
    ];
    const state = fromHistory(messages);
    const assistant = selectMainMessages(state)[1];
    expect(assistant.blocks?.map((b) => b.type)).toEqual(['text', 'tool_call']);
    expect(assistant.blocks![0].content).toBe('let me look');
  });

  it('splits multimodal user messages into text content + attachments', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: '看这两张图' },
          { type: 'image_url', image_url: { url: 'file:img-1-screenshot.png' } },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,QUJD' } },
        ],
        timestamp: 1000,
      },
      { role: 'assistant', content: '看到了。', type: 'action', timestamp: 2000 },
    ];
    const state = fromHistory(messages);
    const user = selectMainMessages(state)[0];
    expect(user.role).toBe('user');
    expect(user.content).toBe('看这两张图');
    expect(user.attachments).toHaveLength(2);
    // file: 引用取 basename 作附件名,mime 按扩展名;url 原样保留(宿主
    // 渲染前自行解析)。
    expect(user.attachments![0]).toMatchObject({
      name: 'img-1-screenshot.png',
      mimeType: 'image/png',
      url: 'file:img-1-screenshot.png',
    });
    // data URL 从 scheme 猜 mime。
    expect(user.attachments![1]).toMatchObject({
      name: 'image',
      mimeType: 'image/jpeg',
      url: 'data:image/jpeg;base64,QUJD',
    });
    // 纯图消息(无 text part)content 为空串,attachments 仍在。
    const imageOnly: ColtsMessageInput[] = [
      { role: 'user', content: [{ type: 'image_url', image_url: { url: 'file:x.png' } }] },
    ];
    const onlyUser = selectMainMessages(fromHistory(imageOnly))[0];
    expect(onlyUser.content).toBe('');
    expect(onlyUser.attachments).toHaveLength(1);
  });

  it('keeps plain-text user messages attachment-free (backward compatible)', () => {
    const messages: ColtsMessageInput[] = [{ role: 'user', content: 'hi', timestamp: 1000 }];
    const user = selectMainMessages(fromHistory(messages))[0];
    expect(user.content).toBe('hi');
    expect(user.attachments).toBeUndefined();
  });

  it('degrades assistant parts content to [image] placeholder text', () => {
    // assistant 侧正常不含图,但 parts 形态必须安全降级而不是塞进数组。
    const messages: ColtsMessageInput[] = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: '图在这里' },
          { type: 'image_url', image_url: { url: 'https://x/y.png' } },
        ],
        type: 'action',
        timestamp: 1000,
      },
    ];
    const assistant = selectMainMessages(fromHistory(messages))[0];
    expect(assistant.content).toBe('图在这里\n[image]');
  });
});

describe('fromHistory — defensive branches', () => {
  it('tolerates assistant rows with nullish content', () => {
    const messages = [
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: undefined, type: 'action', timestamp: 2000 },
    ] as unknown as ColtsMessageInput[];
    const msgs = selectMainMessages(fromHistory(messages));
    // nullish content projects to '' — no text block, no bubble appended
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe('user');
  });

  it('maps image extensions and data URLs to mime types', () => {
    const messages: ColtsMessageInput[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'see' },
          { type: 'image_url', image_url: { url: 'file:a.jpg' } },
          { type: 'image_url', image_url: { url: 'file:b.gif' } },
          { type: 'image_url', image_url: { url: 'file:c.webp' } },
          { type: 'image_url', image_url: { url: 'file:d.svg' } },
          { type: 'image_url', image_url: { url: 'data:image/png;base64,AA' } },
        ],
        timestamp: 1000,
      },
    ];
    const msg = selectMainMessages(fromHistory(messages))[0];
    expect(msg.attachments!.map((a) => a.mimeType)).toEqual([
      'image/jpeg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/png',
    ]);
    // `file:` reference keeps its basename as the attachment name
    expect(msg.attachments![0].name).toBe('a.jpg');
  });

  it('delegate result without status falls back to success', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'go', timestamp: 1000 },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'd1', name: 'delegate', arguments: { agent: 'a', task: 't' } }],
        timestamp: 2000,
      },
      {
        role: 'tool',
        content: JSON.stringify({ answer: 'ok' }),
        toolCallId: 'd1',
        timestamp: 3000,
      },
    ];
    const state = fromHistory(messages);
    const block = state.main.messages
      .find((m) => m.role === 'assistant')
      ?.blocks?.find((b) => b.type === 'subagent');
    expect(block!.status).toBe('completed');
    expect(block!.metadata?.resultStatus).toBe('success');
  });
});
