/**
 * @fileoverview fromHistory unit tests — colts Message[] → SessionRunState
 */
import { describe, it, expect } from 'vitest';
import { fromHistory } from '../../src/fromHistory.js';
import { selectSubAgent, selectMainMessages } from '../../src/selectors.js';
import type { ColtsMessageInput } from '../../src/types.js';

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
          { id: 'call-d1', name: 'delegate', arguments: { agent: 'researcher', task: 'find papers' } },
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
