/**
 * @fileoverview fromHistory — reconstruct SessionRunState from colts Message[]
 *
 * Colts persists flat messages (role/content/toolCalls/toolName) in strict
 * chronological order: per LLM call the thought row comes first, then the
 * action/text row (prose + toolCalls of the same completion), then the
 * tool result rows. This module rebuilds structured AgentMessage[] by
 * APPENDING blocks in that exact order:
 * - type:'thought' → thinking block
 * - row content → text block (before the row's tool blocks — live SSE also
 *   delivers the tokens of a completion before its tool-start events, so
 *   both paths agree)
 * - toolCalls + role:'tool' result → tool_call / skill / human_input / subagent block
 *
 * The result is block-for-block identical to what the live reducer produces
 * for the same conversation — resume must never reshuffle the layout.
 *
 * Limitations: sub-agent internal conversations, a2ui, and streaming
 * animations are runtime-only and cannot be reconstructed.
 */

import type {
  SessionRunState,
  AgentMessage,
  AgentBlock,
  MessageAttachment,
  SubAgentRunState,
  TodoListSnapshot,
} from './types.js';
import { createEmptySessionState, createEmptyRunState } from './types.js';
import type { ColtsContentPart, ColtsMessageInput } from '../types.js';
import type { TurnUsage } from './types.js';

/**
 * 归一持久化的轮用量(wire → TurnUsage)。wrangler.rs 的键是
 * `cacheRead`/`cacheWrite`(无 Tokens 后缀);顺手对全部字段做类型防御
 * ——state.json 是外部输入,坏值落到 0 而不是把渲染方炸成 undefined。
 */
export function normalizeTurnUsage(raw: unknown): TurnUsage | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return {
    inputTokens: n(r.inputTokens),
    outputTokens: n(r.outputTokens),
    cacheReadTokens: n(r.cacheReadTokens ?? r.cacheRead),
    cacheWriteTokens: n(r.cacheWriteTokens ?? r.cacheWrite),
    durationMs: n(r.durationMs),
  };
}

/** fromHistory 的可选附加输入(daemon 持久化在 context.todoList 的快照)。 */
export interface FromHistoryExtras {
  /** 给了就恢复 state.todoList(侧栏据此渲染),并合成一个内联 todo 块。 */
  todoList?: TodoListSnapshot;
}

let histBlockIdCounter = 0;
function genHistBlockId(): string {
  return `hist-blk-${++histBlockIdCounter}`;
}

let histAttachmentIdCounter = 0;

/** colts content 的文本投影:字符串原样;parts 按 plain_text 规则拼接
 * (text 段 + 图片 [image] 占位),与 daemon 的事件/token 估算口径一致。 */
function textOf(content: string | ColtsContentPart[] | undefined): string {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  return content
    .map((p) => (p.type === 'text' ? p.text : '[image]'))
    .filter((s) => s.length > 0)
    .join('\n');
}

/** `file:` 引用的 basename 作为附件名(如 file:img-1.png → img-1.png)。 */
function attachmentNameOf(url: string): string {
  if (url.startsWith('file:')) {
    const base = url.slice('file:'.length).split('/').pop();
    if (base) return base;
  }
  return 'image';
}

/** 从 data URL 或文件扩展名猜 mime,兜底 image/png。 */
function attachmentMimeOf(url: string): string {
  const dataMatch = /^data:([^;,]+)[;,]/.exec(url);
  if (dataMatch) return dataMatch[1];
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return 'image/png';
}

/** user 消息的 content 拆分:文本进 content,图片成 attachments。
 * `file:` 引用的 url 原样保留——宿主(gmemo)在渲染前自行解析成可展示 URL。 */
function normalizeUserContent(content: string | ColtsContentPart[]): {
  text: string;
  attachments?: MessageAttachment[];
} {
  if (typeof content === 'string') return { text: content };
  const text = content
    .filter((p): p is Extract<ColtsContentPart, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .filter((s) => s.length > 0)
    .join('\n');
  const attachments = content
    .filter((p): p is Extract<ColtsContentPart, { type: 'image_url' }> => p.type === 'image_url')
    .map((p) => ({
      id: `hist-att-${++histAttachmentIdCounter}`,
      name: attachmentNameOf(p.image_url.url),
      mimeType: attachmentMimeOf(p.image_url.url),
      url: p.image_url.url,
    }));
  return { text, attachments: attachments.length > 0 ? attachments : undefined };
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
export function fromHistory(
  messages: ColtsMessageInput[],
  extras?: FromHistoryExtras
): SessionRunState {
  const state = createEmptySessionState();
  const agentMessages: AgentMessage[] = [];
  const subAgents = new Map<string, SubAgentRunState>();
  // The assistant bubble currently being built. One turn spans multiple
  // persisted rows (per LLM call), so consecutive assistant rows without an
  // intervening user message merge into this single bubble.
  let current: AgentMessage | null = null;

  // Index tool results by toolCallId for pairing
  const toolResults = new Map<string, ColtsMessageInput>();
  for (const msg of messages) {
    if (msg.role === 'tool' && msg.toolCallId) {
      toolResults.set(msg.toolCallId, msg);
    }
  }

  for (const msg of messages) {
    if (msg.role === 'user') {
      const { text, attachments } = normalizeUserContent(msg.content);
      agentMessages.push({
        id: `hist-msg-${agentMessages.length}`,
        role: 'user',
        content: text,
        ...(attachments ? { attachments } : {}),
        status: 'completed',
        createdAt: msg.timestamp,
      });
      // A user message starts a new turn: later assistant rows must not
      // merge into the previous turn's bubble.
      current = null;
      continue;
    }

    if (msg.role === 'assistant') {
      const msgText = textOf(msg.content);
      // Check for thinking (type='thought')
      if (msg.type === 'thought') {
        const thinkingBlock: AgentBlock = {
          id: genHistBlockId(),
          type: 'thinking',
          status: 'completed',
          content: msgText,
        };
        // Append in storage order — the thought row sits exactly where the
        // reasoning happened (usually right before its action row).
        if (current) {
          current.blocks = [...(current.blocks ?? []), thinkingBlock];
        } else {
          current = {
            id: `hist-msg-${agentMessages.length}`,
            role: 'assistant',
            content: '',
            status: 'completed',
            createdAt: msg.timestamp,
            blocks: [thinkingBlock],
          };
          agentMessages.push(current);
        }
        continue;
      }

      // Assistant row (action or text). Prose comes FIRST: the row's
      // content and its tool calls belong to the same completion, and the
      // live path streams the tokens before the tool-start events.
      const blocks: AgentBlock[] = [];
      if (msgText) {
        blocks.push({
          id: genHistBlockId(),
          type: 'text',
          status: 'completed',
          content: msgText,
        });
      }
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        for (const tc of msg.toolCalls) {
          const result = toolResults.get(tc.id);
          const resultContent = result ? textOf(result.content) : '';

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
            // Minimal sub-run conversation (task + final answer) shared by the
            // parent block metadata (SubAgentModal) and the SubAgentRunState.
            const histMessages = [
              {
                id: `hist-sub-${subtaskId}-task`,
                role: 'user' as const,
                content: (tc.arguments.task as string) ?? '',
                status: 'completed' as const,
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
            ];
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
                // Flat token fields — matches SubAgentBlockMetadata / chat UI.
                inputTokens: delegateResult.tokens?.input,
                outputTokens: delegateResult.tokens?.output,
                duration: delegateResult.duration,
                error: delegateResult.error,
                messages: histMessages,
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
                messages: histMessages,
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
                // 可选来源字段('mcp'|'builtin'|'script'),与实时路径同约定。
                ...(tc.toolType ? { toolType: tc.toolType } : {}),
              },
            });
          }
        }
      }

      // If there are blocks, attach to an assistant message
      // If there's also text content, it's the assistant's reasoning/answer
      if (blocks.length > 0 || msgText) {
        // Merge into the current turn's bubble when one exists (the storage
        // layer splits one turn into one row per LLM call — action/text/
        // thought — so the reconstructed view must rejoin them into a single
        // bubble to match the live reducer, which merges a whole run).
        if (current) {
          current.blocks = [...(current.blocks ?? []), ...blocks];
          current.content = current.content + msgText;
        } else {
          current = {
            id: `hist-msg-${agentMessages.length}`,
            role: 'assistant',
            content: msgText,
            status: 'completed',
            createdAt: msg.timestamp,
            blocks: blocks.length > 0 ? blocks : undefined,
          };
          agentMessages.push(current);
        }
        // 轮用量:wrangler.rs 写在轮末 assistant 行上——谁带着就赋给当前
        // 气泡(末值胜出 = 轮末值)。wire 键经 normalizeTurnUsage 归一
        // (缓存字段无 Tokens 后缀,且为多来源防御);旧档无键自然不带。
        const usage = normalizeTurnUsage(msg.usage);
        if (usage && current) {
          current.usage = usage;
        }
      }
      continue;
    }

    // role:'tool' messages are consumed via pairing above, skip standalone
    if (msg.role === 'tool') continue;

    // System messages
    if (msg.role === 'system') {
      // 轮级动态提醒行(时间上下文,daemon 每轮落盘、装配器合并进 user
      // 消息发给 LLM):纯 wire 参与者,不进 UI —— 跳过且**不得**重置
      // `current`,否则会把轮内 assistant 气泡切成两半。
      if (msg.type === 'system-reminder') continue;
      agentMessages.push({
        id: `hist-msg-${agentMessages.length}`,
        role: 'system',
        content: textOf(msg.content),
        status: 'completed',
        createdAt: msg.timestamp,
      });
      current = null;
      continue;
    }
  }

  state.main = {
    ...createEmptyRunState(),
    status: 'idle',
    messages: agentMessages,
  };
  state.subAgents = subAgents;

  // todo 快照恢复:state.todoList 供侧栏渲染;内联块只合成一个(快照语义
  // —— 表现最终清单,不为历史里的每次写入补块),挂到最后一条 assistant
  // 消息末尾。
  const snapshot = extras?.todoList;
  if (snapshot && snapshot.items.length > 0) {
    state.main.todoList = snapshot;
    for (let i = agentMessages.length - 1; i >= 0; i--) {
      const m = agentMessages[i];
      if (m.role !== 'assistant') continue;
      const todoBlock: AgentBlock = {
        id: genHistBlockId(),
        type: 'todo',
        status: 'completed',
        content: '',
        metadata: { items: snapshot.items },
      };
      m.blocks = [...(m.blocks ?? []), todoBlock];
      break;
    }
  }

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
