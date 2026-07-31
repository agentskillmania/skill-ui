/**
 * @fileoverview fromHistory — reconstruct SessionRunState from colts Message[]
 *
 * Colts persists flat messages (role/content/toolCalls/toolName).
 * This module rebuilds structured AgentMessage[] with blocks by:
 * - type:'thought' → thinking block
 * - toolCalls + role:'tool' result → tool_call / skill / human_input / subagent block
 * - assistant without toolCalls → plain content
 *
 * Limitations: sub-agent internal conversations, a2ui, and streaming
 * animations are runtime-only and cannot be reconstructed.
 */

import type { SessionRunState, AgentMessage, AgentBlock, SubAgentRunState } from './types.js';
import { createEmptySessionState, createEmptyRunState } from './types.js';
import type { ColtsMessageInput } from '../types.js';

let histBlockIdCounter = 0;
function genHistBlockId(): string {
  return `hist-blk-${++histBlockIdCounter}`;
}

/** Tool names that map to special block types */
const SKILL_TOOL = 'load_skill';
const HUMAN_TOOL = 'ask_human';
const DELEGATE_TOOL = 'delegate';

/**
 * Reconstruct a SessionRunState from persisted colts messages.
 *
 * Messages are processed sequentially. Assistant messages with toolCalls
 * are paired with their subsequent role:'tool' result messages to build
 * blocks. Sub-agent (delegate) results are parsed for summary metrics.
 */
export function fromHistory(messages: ColtsMessageInput[]): SessionRunState {
  const state = createEmptySessionState();
  const agentMessages: AgentMessage[] = [];
  const subAgents = new Map<string, SubAgentRunState>();

  // Index tool results by toolCallId for pairing
  const toolResults = new Map<string, ColtsMessageInput>();
  for (const msg of messages) {
    if (msg.role === 'tool' && msg.toolCallId) {
      toolResults.set(msg.toolCallId, msg);
    }
  }

  for (const msg of messages) {
    if (msg.role === 'user') {
      agentMessages.push({
        id: `hist-msg-${agentMessages.length}`,
        role: 'user',
        content: msg.content,
        status: 'completed',
        createdAt: msg.timestamp,
      });
      continue;
    }

    if (msg.role === 'assistant') {
      // Check for thinking (type='thought')
      if (msg.type === 'thought') {
        // Find the next non-thought assistant message to attach this thinking to
        const thinkingBlock: AgentBlock = {
          id: genHistBlockId(),
          type: 'thinking',
          status: 'completed',
          content: msg.content,
        };
        // Attach to the last assistant message, or create a wrapper
        const lastMsg = agentMessages[agentMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.status === 'completed') {
          lastMsg.blocks = [thinkingBlock, ...(lastMsg.blocks ?? [])];
        } else {
          agentMessages.push({
            id: `hist-msg-${agentMessages.length}`,
            role: 'assistant',
            content: '',
            status: 'completed',
            createdAt: msg.timestamp,
            blocks: [thinkingBlock],
          });
        }
        continue;
      }

      // Assistant with tool calls
      const blocks: AgentBlock[] = [];
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        for (const tc of msg.toolCalls) {
          const result = toolResults.get(tc.id);
          const resultContent = result?.content ?? '';

          if (tc.name === SKILL_TOOL) {
            blocks.push({
              id: genHistBlockId(),
              type: 'skill',
              status: 'completed',
              content: resultContent ? `Result: ${resultContent.slice(0, 200)}` : '',
              metadata: {
                skillName: tc.arguments.name ?? '',
                phase: 'completed',
                result: resultContent,
              },
            });
          } else if (tc.name === HUMAN_TOOL) {
            // Parse questions from tool arguments
            const questions =
              (tc.arguments.questions as Array<{
                question: string;
                type: string;
                options?: string[];
              }>) ?? [];
            blocks.push({
              id: tc.id,
              type: 'human_input',
              status: 'completed',
              content: '',
              metadata: {
                requestId: tc.id,
                inputType: 'input',
                title: tc.arguments.context ?? 'AI needed your input',
                message: questions.map((q) => q.question).join('\n'),
                response: resultContent,
              },
            });
          } else if (tc.name === DELEGATE_TOOL) {
            // Parse DelegateResult from tool result
            const delegateResult = parseDelegateResult(resultContent);
            const subtaskId = `hist-${tc.id}`;
            blocks.push({
              id: genHistBlockId(),
              type: 'subagent',
              status: delegateResult.status === 'error' ? 'error' : 'completed',
              content: '',
              metadata: {
                subtaskId,
                name: tc.arguments.agent ?? '',
                task: tc.arguments.task ?? '',
                resultStatus: delegateResult.status,
                steps: delegateResult.totalSteps,
                tokens: delegateResult.tokens,
                duration: delegateResult.duration,
                error: delegateResult.error,
              },
            });
            // Create a minimal SubAgentRunState with summary data (no internal conversation)
            if (delegateResult.status === 'success' || delegateResult.answer) {
              const subRun: SubAgentRunState = {
                ...createEmptyRunState(),
                status: 'idle',
                name: (tc.arguments.agent as string) ?? '',
                task: (tc.arguments.task as string) ?? '',
                parentBlockId: blocks[blocks.length - 1].id,
                resultStatus: delegateResult.status as SubAgentRunState['resultStatus'],
                totalSteps: delegateResult.totalSteps,
                tokens: delegateResult.tokens ?? {
                  input: 0,
                  output: 0,
                  cacheRead: 0,
                  cacheWrite: 0,
                },
                duration: delegateResult.duration ?? 0,
                error: delegateResult.error,
                messages: [
                  {
                    id: `hist-sub-${subtaskId}-task`,
                    role: 'user',
                    content: (tc.arguments.task as string) ?? '',
                    status: 'completed',
                  },
                  ...(delegateResult.answer
                    ? [
                        {
                          id: `hist-sub-${subtaskId}-answer`,
                          role: 'assistant' as const,
                          content: delegateResult.answer,
                          status: 'completed' as const,
                        },
                      ]
                    : []),
                ],
              };
              subAgents.set(subtaskId, subRun);
            }
          } else {
            // Regular tool call
            blocks.push({
              id: tc.id,
              type: 'tool_call',
              status: 'completed',
              content: '',
              metadata: {
                toolName: tc.name,
                toolArgs: JSON.stringify(tc.arguments),
                toolResult: resultContent,
              },
            });
          }
        }
      }

      // If there are blocks, attach to an assistant message
      // If there's also text content, it's the assistant's reasoning/answer
      if (blocks.length > 0 || msg.content) {
        agentMessages.push({
          id: `hist-msg-${agentMessages.length}`,
          role: 'assistant',
          content: msg.content ?? '',
          status: 'completed',
          createdAt: msg.timestamp,
          blocks: blocks.length > 0 ? blocks : undefined,
        });
      }
      continue;
    }

    // role:'tool' messages are consumed via pairing above, skip standalone
    if (msg.role === 'tool') continue;

    // System messages
    if (msg.role === 'system') {
      agentMessages.push({
        id: `hist-msg-${agentMessages.length}`,
        role: 'system',
        content: msg.content,
        status: 'completed',
        createdAt: msg.timestamp,
      });
      continue;
    }
  }

  state.main = {
    ...createEmptyRunState(),
    status: 'idle',
    messages: agentMessages,
  };
  state.subAgents = subAgents;

  return state;
}

/** Parse a DelegateResult from a tool result string */
function parseDelegateResult(resultStr: string): {
  status: string;
  answer?: string;
  error?: string;
  totalSteps?: number;
  tokens?: { input: number; output: number; cacheRead: number; cacheWrite: number };
  duration?: number;
} {
  try {
    const parsed = JSON.parse(resultStr);
    return {
      status: parsed.status ?? 'success',
      answer: parsed.answer,
      error: parsed.error,
      totalSteps: parsed.totalSteps,
      tokens: parsed.tokens,
      duration: parsed.duration,
    };
  } catch {
    // Non-JSON result — treat as plain answer
    return { status: 'success', answer: resultStr };
  }
}
