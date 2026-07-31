/**
 * @fileoverview fromHistory unit tests — colts Message[] → SessionRunState
 */
import { describe, it, expect } from 'vitest';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import { selectSubAgent, selectMainMessages } from '../../../src/core/conversation/selectors.js';
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

  it('reconstructs skill blocks from load_skill tool calls', () => {
    const messages: ColtsMessageInput[] = [
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
    ];
    const state = fromHistory(messages);
    const msgs = selectMainMessages(state);
    const skillBlock = msgs[0].blocks?.find((b) => b.type === 'skill');
    expect(skillBlock).toBeDefined();
    expect(skillBlock!.metadata?.skillName).toBe('poet');
    expect(skillBlock!.metadata?.phase).toBe('completed');
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

    // Check sub-agent state
    const subtaskId = subBlock!.metadata?.subtaskId as string;
    const sub = selectSubAgent(state, subtaskId);
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
    const sub = selectSubAgent(state, subtaskId);
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
