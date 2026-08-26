/**
 * @fileoverview Core reducer — SSE event → SessionRunState
 *
 * Pure function: (state, event) → state.
 * Routes events to main agent or sub-agent based on event name prefix.
 * Manages block lifecycle (create/update/complete), token accumulation,
 * message content streaming, and event log append.
 */

import type {
  SessionRunState,
  AgentRunState,
  AgentMessage,
  AgentBlock,
  AgentEvent,
  EventCategory,
  TokenStats,
  TurnUsage,
  SubAgentRunState,
  TodoItem,
  TodoListSnapshot,
} from './types.js';
import { createEmptyRunState, ZERO_TOKENS } from './types.js';
import type { SSEEvent } from '../types.js';

// ─── ID generation ────────────────────────────────────────────────

let blockIdCounter = 0;
function genBlockId(): string {
  return `blk-${Date.now()}-${++blockIdCounter}`;
}

let eventIdCounter = 0;
function genEventId(): string {
  return `evt-${Date.now()}-${++eventIdCounter}`;
}

// ─── Event classification ─────────────────────────────────────────

/** Determine if an event targets a sub-agent (prefix 'subagent-') */
function isSubAgentEvent(eventName: string): boolean {
  return eventName.startsWith('subagent-') && eventName !== 'subagent-start';
}

/** Map SSE event name to cockpit category */
function categorize(eventName: string): EventCategory {
  if (eventName.startsWith('step-') || eventName === 'done') return 'lifecycle';
  if (eventName === 'phase-change') return 'phase';
  if (eventName === 'thinking' || eventName === 'subagent-thinking') return 'thinking';
  if (eventName === 'token' || eventName === 'subagent-token') return 'token';
  if (eventName.startsWith('llm-')) return 'llm';
  if (eventName.startsWith('tool-') || eventName.startsWith('subagent-tool')) return 'tool';
  if (eventName.startsWith('skill-')) return 'skill';
  if (eventName.startsWith('subagent')) return 'subagent';
  if (eventName === 'compressing' || eventName === 'compressed') return 'compressing';
  if (eventName === 'session-cleared') return 'lifecycle';
  if (eventName.startsWith('human')) return 'human';
  if (eventName === 'error') return 'error';
  return 'lifecycle';
}

/** Build a human-readable label for an event */
function labelFor(eventName: string, data: Record<string, unknown>): string {
  const name = (data.name as string) ?? (data.subagentName as string) ?? '';
  switch (eventName) {
    case 'step-start':
      return `Step ${data.step}`;
    case 'step-end':
      return `Step ${data.step} done`;
    case 'done':
      return 'Completed';
    case 'thinking':
      return 'Thinking';
    case 'token':
      return 'Token';
    case 'tool-start':
      return `Tool: ${data.name ?? 'unknown'}`;
    case 'tool-end':
      return `Tool result: ${data.callId ?? ''}`;
    case 'skill-loading':
      return `Loading skill: ${name}`;
    case 'skill-loaded':
      return `Skill loaded: ${name}`;
    case 'skill-start':
      return `Skill executing: ${name}`;
    case 'skill-end':
      return `Skill done: ${name}`;
    case 'subagent-start':
      return `Sub-agent: ${name}`;
    case 'subagent-end':
      return `Sub-agent done: ${name}`;
    case 'subagent-token':
      return `Sub-agent token: ${name}`;
    case 'subagent-thinking':
      return `Sub-agent thinking: ${name}`;
    case 'llm-request':
      return 'LLM request';
    case 'llm-response':
      return 'LLM response';
    case 'phase-change': {
      // `to` arrives as an object ({ type }) from one daemon and as a plain
      // string from the other — handle both.
      const to = data.to;
      const toType = typeof to === 'string' ? to : ((to as { type?: string })?.type ?? '');
      return `Phase: → ${toType}`;
    }
    case 'compressing':
      return 'Compressing context';
    case 'compressed':
      return `Compressed: -${data.removedCount ?? 0} messages`;
    case 'system-message':
      // Marker rows synthesized by the host (compaction / model switch / …).
      // The host owns the copy — `label` carries a short one for the event log.
      return (data.label as string) ?? 'System';
    case 'session-cleared':
      return 'Session cleared';
    case 'human-input':
      return 'Human input needed';
    case 'human-input-resolved':
      return 'Human input resolved';
    case 'error':
      return `Error: ${data.message ?? ''}`;
    default:
      return eventName;
  }
}

/** Build an event log entry from an SSE event */
function toEventLog(eventName: string, data: Record<string, unknown>): AgentEvent {
  return {
    id: genEventId(),
    timestamp: (data.timestamp as number) ?? Date.now(),
    type: eventName,
    category: categorize(eventName),
    label: labelFor(eventName, data),
    payload: { ...data },
  };
}

// ─── Event log ────────────────────────────────────────────────────

/**
 * Cap the event log. Every reducer call used to copy the full array
 * (`[...events, entry]`), so a long session paid O(n) per token — O(n²)
 * total — and retained every full tool result payload forever. The cockpit
 * event log folds token streams anyway; keeping the newest entries is
 * enough.
 */
const MAX_EVENT_LOG = 5000;

function appendEvent(events: AgentEvent[], entry: AgentEvent): AgentEvent[] {
  if (events.length >= MAX_EVENT_LOG) {
    return [...events.slice(events.length - MAX_EVENT_LOG + 1), entry];
  }
  return [...events, entry];
}

// ─── Token helpers ────────────────────────────────────────────────

function addTokens(a: TokenStats, b?: Partial<TokenStats>): TokenStats {
  if (!b) return { ...a };
  return {
    input: a.input + (b.input ?? 0),
    output: a.output + (b.output ?? 0),
    cacheRead: a.cacheRead + (b.cacheRead ?? 0),
    cacheWrite: a.cacheWrite + (b.cacheWrite ?? 0),
  };
}

function extractTokens(data: Record<string, unknown>): TokenStats | undefined {
  // 线上格式有两种:wanderer TS(colts)发 camelCase,wrangler.rs(Rust)的
  // TokenStats 无 serde rename,发 snake_case。两者都接。
  const t = data.tokens as
    | (Partial<TokenStats> & { cache_read?: number; cache_write?: number })
    | undefined;
  if (!t) return undefined;
  return {
    input: t.input ?? 0,
    output: t.output ?? 0,
    cacheRead: t.cacheRead ?? t.cache_read ?? 0,
    cacheWrite: t.cacheWrite ?? t.cache_write ?? 0,
  };
}

/** Assemble the per-turn usage stamped on the turn's final assistant message.
 * Returns undefined when everything is zero (command echoes, turns that
 * errored before the first step) — absence is the render-side "no usage". */
function toTurnUsage(tokens: TokenStats, durationMs: number): TurnUsage | undefined {
  if (
    tokens.input === 0 &&
    tokens.output === 0 &&
    tokens.cacheRead === 0 &&
    tokens.cacheWrite === 0 &&
    durationMs === 0
  ) {
    return undefined;
  }
  return {
    inputTokens: tokens.input,
    outputTokens: tokens.output,
    cacheReadTokens: tokens.cacheRead,
    cacheWriteTokens: tokens.cacheWrite,
    durationMs,
  };
}

// ─── Message/block helpers ────────────────────────────────────────

/** Find the current streaming assistant message in a run state, or create one */
function ensureStreamingMessage(run: AgentRunState): { run: AgentRunState; messageId: string } {
  const msgs = run.messages;
  const last = msgs[msgs.length - 1];
  if (last && last.role === 'assistant' && last.status === 'streaming') {
    return { run, messageId: last.id };
  }
  // Create a new streaming assistant message
  const newMsg: AgentMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'assistant',
    content: '',
    status: 'streaming',
    createdAt: Date.now(),
  };
  return {
    run: { ...run, messages: [...msgs, newMsg] },
    messageId: newMsg.id,
  };
}

/**
 * Close open THINKING blocks on a message.
 *
 * Only thinking blocks are closed: a new tool-start must not flip previously
 * created streaming tool_call blocks (parallel tool invocations arrive as a
 * burst of tool-start events) to completed, or their tool-end results would
 * never match by call id — leaving earlier blocks spinning forever without
 * their result.
 */
function closeThinkingBlocks(blocks: AgentBlock[]): AgentBlock[] {
  return blocks.map((b) =>
    b.type === 'thinking' && b.status === 'streaming' ? { ...b, status: 'completed' as const } : b
  );
}

/**
 * Close open TEXT blocks on a message.
 *
 * A text segment ends the moment the next segment begins (thinking, tool
 * call, skill, …). closeThinkingBlocks is thinking-only, so without this
 * nothing closed a text block mid-run: every text segment of a run kept
 * its streaming flag until `done`, and the chat UI rendered a blinking
 * cursor on ALL of them at once (the cursor is status-driven).
 */
function closeTextBlocks(blocks: AgentBlock[]): AgentBlock[] {
  return blocks.map((b) =>
    b.type === 'text' && b.status === 'streaming' ? { ...b, status: 'completed' as const } : b
  );
}

/**
 * Close both prose segment kinds (thinking + text). Used when a non-prose
 * block starts (tool call, skill, human input, sub-agent): the prose that
 * preceded it is finished by definition.
 */
function closeProseBlocks(blocks: AgentBlock[]): AgentBlock[] {
  return closeTextBlocks(closeThinkingBlocks(blocks));
}

/** Close every still-streaming block (terminal events: done, sub-agent end). */
function closeAllBlocks(blocks: AgentBlock[]): AgentBlock[] {
  return blocks.map((b) => (b.status === 'streaming' ? { ...b, status: 'completed' as const } : b));
}

/** Locate the singleton todo block maintained by the todo-list handler
 * (latest match wins — there should only ever be one per run). */
function findTodoBlock(messages: AgentMessage[]): { messageId: string; blockId: string } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const b = messages[i].blocks?.find((x) => x.type === 'todo');
    if (b) return { messageId: messages[i].id, blockId: b.id };
  }
  return null;
}

/**
 * Close blocks on terminal events (done/error). Streaming blocks flip to the
 * terminal status; pending human_input blocks flip too — once the run is over,
 * a still-interactive input would accept answers nobody reads.
 */
function closeTerminalBlocks(blocks: AgentBlock[], status: 'completed' | 'error'): AgentBlock[] {
  return blocks.map((b) =>
    b.status === 'streaming' || (b.type === 'human_input' && b.status === 'pending')
      ? { ...b, status }
      : b
  );
}

// ─── Main agent event handlers ────────────────────────────────────

function reduceMainEvent(
  state: AgentRunState,
  eventName: string,
  data: Record<string, unknown>
): AgentRunState {
  switch (eventName) {
    // ── User message (not from colts — injected by the consumer hook) ──
    case 'user-message': {
      const attachments = (data.attachments as AgentMessage['attachments']) ?? undefined;
      const userMsg: AgentMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: 'user',
        content: (data.content as string) ?? '',
        // 多模态附件(图片)随消息级透传——不进 blocks(blocks 是 assistant
        // 的时序渲染单元)。
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
        status: 'completed',
        createdAt: Date.now(),
      };
      // Pre-create an empty streaming assistant message so the typing
      // indicator shows immediately, before the first token/thinking event.
      const pendingAssistant: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: Date.now(),
      };
      // A user message opens a new turn: drop the previous turn's
      // step-delta accumulators so done/error stamp THIS turn's usage only.
      return {
        ...state,
        turnTokens: { ...ZERO_TOKENS },
        turnDurationMs: 0,
        messages: [...state.messages, userMsg, pendingAssistant],
      };
    }

    // ── System marker (host-synthesized: compaction, model switch, …) ──
    // Unlike user-message this does NOT pre-create a streaming assistant
    // message: a marker is a completed one-liner (rendered centered by the
    // chat UI), not a turn opener. Chronological append-only, like everything
    // else — if a marker lands mid-run (auto-compaction between steps), the
    // next token starts a fresh assistant bubble after it.
    case 'system-message': {
      const sysMsg: AgentMessage = {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: 'system',
        content: (data.content as string) ?? '',
        status: 'completed',
        createdAt: (data.timestamp as number) ?? Date.now(),
      };
      return { ...state, messages: [...state.messages, sysMsg] };
    }

    // ── Streaming tokens ──
    case 'token': {
      const delta = (data.delta as string) ?? '';
      // LLM streams emit empty `token` frames between reasoning segments.
      // They must neither close an open thinking block nor spawn an empty
      // text block (an empty block would suppress the typing indicator and
      // render as a stray gap).
      if (!delta) return state;
      const { run, messageId } = ensureStreamingMessage(state);
      return {
        ...run,
        messages: run.messages.map((m) => {
          if (m.id !== messageId) return m;
          // Real content closes open thinking blocks — a text segment begins.
          const blocks = closeThinkingBlocks(m.blocks ?? []);
          const last = blocks[blocks.length - 1];
          // Text is a block like any other: append into the trailing open
          // text segment, or open a new one right after whatever came last
          // (thinking, tool call, …). Block array order IS the render order.
          if (last?.type === 'text' && last.status === 'streaming') {
            return {
              ...m,
              content: m.content + delta,
              blocks: blocks.map((b) =>
                b.id === last.id ? { ...b, content: b.content + delta } : b
              ),
            };
          }
          const textBlock: AgentBlock = {
            id: genBlockId(),
            type: 'text',
            status: 'streaming',
            content: delta,
          };
          return { ...m, content: m.content + delta, blocks: [...blocks, textBlock] };
        }),
      };
    }

    case 'thinking': {
      const { run, messageId } = ensureStreamingMessage(state);
      const content = (data.content as string) ?? '';
      return {
        ...run,
        messages: run.messages.map((m) => {
          if (m.id !== messageId) return m;
          // Reasoning (re)starts — any open text segment is finished.
          const blocks = closeTextBlocks(m.blocks ?? []);
          // Find an open thinking block
          const openThinking = blocks.find(
            (b) => b.type === 'thinking' && b.status === 'streaming'
          );
          if (openThinking) {
            return {
              ...m,
              blocks: blocks.map((b) =>
                b.id === openThinking.id ? { ...b, content: b.content + content } : b
              ),
            };
          }
          // An empty delta with no open block means the model produced no
          // reasoning at all (LLM streams start with an empty
          // `reasoning_content` chunk) — never create an empty thinking block.
          if (!content) return m;
          // Create new thinking block
          const block: AgentBlock = {
            id: genBlockId(),
            type: 'thinking',
            status: 'streaming',
            content,
          };
          return { ...m, blocks: [...blocks, block] };
        }),
      };
    }

    // ── Tool calls ──
    case 'tool-start': {
      const { run, messageId } = ensureStreamingMessage(state);
      const toolName = (data.name as string) ?? 'unknown';
      const callId = (data.id as string) ?? genBlockId();
      // load_skill 与 fromHistory 的 SKILL_TOOL 特判保持同构：实时也展示为 skill 块
      const isSkillTool = toolName === 'load_skill';
      const block: AgentBlock = isSkillTool
        ? {
            id: callId,
            type: 'skill',
            status: 'streaming',
            content: '',
            metadata: {
              skillName: (data.args as { name?: string } | undefined)?.name ?? '',
              phase: 'loading',
            },
          }
        : {
            id: callId,
            type: 'tool_call',
            status: 'streaming',
            content: '',
            metadata: {
              toolName,
              toolArgs: JSON.stringify(data.args ?? {}),
              // 可选工具来源('mcp'|'builtin'|'script')——由宿主或 daemon
              // 在帧上补充,这里只负责透传给 ToolCallBlock 的徽章。
              ...(typeof data.toolType === 'string' ? { toolType: data.toolType } : {}),
            },
          };
      return {
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeProseBlocks(m.blocks ?? []), block] } : m
        ),
      };
    }

    case 'tool-end': {
      const callId = (data.callId as string) ?? '';
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (!m.blocks) return m;
          // Match by block id (which was set to callId at tool-start time)
          const targetBlock = m.blocks.find((b) => b.id === callId && b.status === 'streaming');
          if (!targetBlock) {
            // Fallback: match the sole streaming tool_call (backward compat).
            // Only safe when there is exactly one candidate — with parallel
            // tool calls (or duplicate tool-end frames) the callId is the
            // only reliable discriminator; matching the first block would
            // misattribute results and leave blocks spinning forever.
            const streaming = m.blocks.filter(
              (b) => b.type === 'tool_call' && b.status === 'streaming'
            );
            if (streaming.length !== 1) return m;
            const fallback = streaming[0];
            return {
              ...m,
              blocks: m.blocks.map((b) =>
                b.id === fallback.id
                  ? {
                      ...b,
                      status: 'completed' as const,
                      metadata: { ...b.metadata, toolResult: data.result ?? '' },
                    }
                  : b
              ),
            };
          }
          return {
            ...m,
            blocks: m.blocks.map((b) => {
              if (b.id !== callId) return b;
              // load_skill 块按 skill 语义收尾，终态与 fromHistory 一致
              if (b.type === 'skill') {
                const resultStr =
                  typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
                return {
                  ...b,
                  status: 'completed' as const,
                  content: resultStr ? `Result: ${resultStr.slice(0, 200)}` : '',
                  metadata: { ...b.metadata, phase: 'completed', result: resultStr },
                };
              }
              return {
                ...b,
                status: 'completed' as const,
                metadata: { ...b.metadata, toolResult: data.result ?? '' },
              };
            }),
          };
        }),
      };
    }

    // ── Skill lifecycle ──
    case 'skill-loading': {
      const { run, messageId } = ensureStreamingMessage(state);
      const blockId = genBlockId();
      const block: AgentBlock = {
        id: blockId,
        type: 'skill',
        status: 'streaming',
        content: '',
        metadata: { skillName: data.name, phase: 'loading' },
      };
      return {
        ...run,
        activeSkill: (data.name as string) ?? run.activeSkill,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeProseBlocks(m.blocks ?? []), block] } : m
        ),
      };
    }

    case 'skill-loaded':
    case 'skill-start': {
      const phase = eventName === 'skill-loaded' ? 'loaded' : 'executing';
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (!m.blocks) return m;
          const skillBlock = [...m.blocks]
            .reverse()
            .find((b) => b.type === 'skill' && b.status === 'streaming');
          if (!skillBlock) return m;
          return {
            ...m,
            blocks: m.blocks.map((b) =>
              b.id === skillBlock.id
                ? {
                    ...b,
                    metadata: {
                      ...b.metadata,
                      skillName: data.name ?? b.metadata?.skillName,
                      phase,
                      tokenCount: data.tokenCount ?? b.metadata?.tokenCount,
                      task: data.task ?? b.metadata?.task,
                    },
                  }
                : b
            ),
          };
        }),
      };
    }

    case 'skill-end': {
      return {
        ...state,
        activeSkill: null,
        messages: state.messages.map((m) => {
          if (!m.blocks) return m;
          const skillBlock = [...m.blocks]
            .reverse()
            .find((b) => b.type === 'skill' && b.status === 'streaming');
          if (!skillBlock) return m;
          const resultStr =
            typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
          return {
            ...m,
            blocks: m.blocks.map((b) =>
              b.id === skillBlock.id
                ? {
                    ...b,
                    status: 'completed' as const,
                    content: resultStr ? `Result: ${resultStr.slice(0, 200)}` : '',
                    metadata: { ...b.metadata, phase: 'completed', result: resultStr },
                  }
                : b
            ),
          };
        }),
      };
    }

    // ── Human input ──
    case 'human-input': {
      const { run, messageId } = ensureStreamingMessage(state);
      const questions =
        (data.questions as Array<{
          id: string;
          question: string;
          type: string;
          options?: string[];
        }>) ?? [];
      const firstQ = questions[0];
      let inputType: string = 'input';
      let options: Array<{ label: string; value: string }> | undefined;
      if (firstQ) {
        if (firstQ.type === 'single-select' || firstQ.type === 'multi-select') {
          inputType = firstQ.type;
          options = firstQ.options?.map((o) => ({ label: o, value: o }));
        }
      }
      // Always assign a requestId: without one, a later human-input-resolved
      // could never match (block stays pending forever), and two resolved
      // events both missing requestId would mass-complete every block
      // (undefined === undefined).
      const requestId = (data.requestId as string) ?? genBlockId();
      const block: AgentBlock = {
        id: requestId,
        type: 'human_input',
        status: 'pending',
        content: '',
        metadata: {
          requestId,
          inputType,
          title: data.context ?? 'AI needs your input',
          message: questions.map((q) => q.question).join('\n'),
          options,
          // Full question list — HumanInputBlock renders one input per
          // question when this is present (multi-question ask_human).
          questions,
        },
      };
      return {
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeProseBlocks(m.blocks ?? []), block] } : m
        ),
      };
    }

    case 'human-input-resolved': {
      const reqId = data.requestId as string | undefined;
      // No requestId means we cannot identify which block to resolve —
      // matching everything would complete unrelated pending blocks.
      if (!reqId) return state;
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (!m.blocks) return m;
          return {
            ...m,
            blocks: m.blocks.map((b) =>
              b.type === 'human_input' && b.metadata?.requestId === reqId
                ? {
                    ...b,
                    status: 'completed' as const,
                    metadata: { ...b.metadata, response: data.response },
                  }
                : b
            ),
          };
        }),
      };
    }

    // ── LLM ──
    case 'llm-request': {
      return {
        ...state,
        lastLLMRequest: {
          messages: (data.messages as unknown[]) ?? [],
          tools: (data.tools as string[]) ?? [],
          skill: (data.skill as { current: string | null } | null)?.current ?? null,
          model: data.model as string | undefined,
          contextWindow: typeof data.contextWindow === 'number' ? data.contextWindow : undefined,
        },
      };
    }

    case 'llm-response': {
      const tokens = extractTokens(data);
      return {
        ...state,
        // 累计账只在 step-end 累加(每次 LLM 调用恰有一次 step-end;这里
        // 再加一次会双计)。本事件只维护 lastInputTokens —— 最近一次调用
        // 的输入大小,即当前上下文窗口占用(NON-cumulative)。
        // Daemon may send `tokens: {}` — that would zero the gauge, so only
        // trust a positive reading.
        ...(tokens && tokens.input > 0 ? { lastInputTokens: tokens.input } : {}),
      };
    }

    // ── Todo list (live snapshot from either daemon) ──
    case 'todo-list': {
      const rawItems = Array.isArray(data.items) ? (data.items as unknown[]) : [];
      const todoList: TodoListSnapshot = {
        items: rawItems
          .filter(
            (i): i is Record<string, unknown> =>
              !!i &&
              typeof i === 'object' &&
              (typeof (i as Record<string, unknown>).id === 'number' ||
                typeof (i as Record<string, unknown>).id === 'string') &&
              // Number('abc') → NaN would poison downstream id comparisons
              !Number.isNaN(Number((i as Record<string, unknown>).id))
          )
          .map((i) => ({
            id: typeof i.id === 'number' ? i.id : Number(i.id),
            subject: String(i.subject ?? ''),
            status: (['pending', 'in_progress', 'completed'].includes(String(i.status))
              ? String(i.status)
              : 'pending') as TodoItem['status'],
            ...(i.description !== undefined ? { description: String(i.description) } : {}),
            ...(Array.isArray(i.blocks) && i.blocks.length > 0
              ? { blocks: i.blocks.map(Number) }
              : {}),
            ...(Array.isArray(i.blocked_by) && i.blocked_by.length > 0
              ? { blocked_by: i.blocked_by.map(Number) }
              : {}),
          })),
      };
      // 单例内联块:首个非空清单在当前 streaming 消息末尾建 todo 块,后续
      // 事件原地更新 metadata.items(不新建/不挪位/不累积)。终态由
      // done/error 的 closeTerminalBlocks 类型无关收尾,无需特判。
      const existing = findTodoBlock(state.messages);
      if (existing) {
        return {
          ...state,
          todoList,
          messages: state.messages.map((m) =>
            m.id === existing.messageId
              ? {
                  ...m,
                  blocks: (m.blocks ?? []).map((b) =>
                    b.id === existing.blockId
                      ? { ...b, metadata: { ...b.metadata, items: todoList.items } }
                      : b
                  ),
                }
              : m
          ),
        };
      }
      if (todoList.items.length === 0) {
        return { ...state, todoList };
      }
      // The daemon's step loop diffs the todo snapshot AFTER the final step,
      // and that event can reach us AFTER the terminal `done` frame (it rides
      // a different event channel than the runner's own frames — SSE merge
      // order is not guaranteed). Opening a streaming message then would
      // revive a finished run: the bubble would stream forever (blinking
      // cursor, no action buttons, no terminal event ever coming). The
      // "live turn" signal is a trailing streaming assistant message (run
      // `status` itself stays idle while streaming).
      const lastMsg = state.messages[state.messages.length - 1];
      const turnLive = !!lastMsg && lastMsg.role === 'assistant' && lastMsg.status === 'streaming';
      if (!turnLive) {
        const todoBlock: AgentBlock = {
          id: genBlockId(),
          type: 'todo',
          status: 'completed',
          content: '',
          metadata: { items: todoList.items },
        };
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'assistant') {
            const messages = state.messages.map((m, idx) =>
              idx === i ? { ...m, blocks: [...(m.blocks ?? []), todoBlock] } : m
            );
            return { ...state, todoList, messages };
          }
        }
        return { ...state, todoList };
      }
      const { run, messageId } = ensureStreamingMessage(state);
      const todoBlock: AgentBlock = {
        id: genBlockId(),
        type: 'todo',
        status: 'streaming',
        content: '',
        metadata: { items: todoList.items },
      };
      return {
        ...run,
        todoList,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...(m.blocks ?? []), todoBlock] } : m
        ),
      };
    }

    // ── Step lifecycle ──
    case 'step-start': {
      return { ...state, stepCount: (data.step as number) ?? state.stepCount + 1 };
    }

    case 'step-end': {
      const tokens = extractTokens(data);
      const duration = (data.duration as number) ?? 0;
      return {
        ...state,
        tokens: tokens ? addTokens(state.tokens, tokens) : state.tokens,
        duration: state.duration + duration,
        // Turn-scoped mirror of the accumulators above: done/error prefer the
        // authoritative turn totals from the terminal payload and only fall
        // back to these deltas (abort/error paths where done carries nothing).
        turnTokens: tokens ? addTokens(state.turnTokens, tokens) : state.turnTokens,
        turnDurationMs: state.turnDurationMs + duration,
      };
    }

    // ── Compression ──
    case 'compressing': {
      return state;
    }

    case 'compressed': {
      // daemon(wrangler.rs)自 0.x 起在压缩完成时附带 `estimatedContextSize`
      // —— 压缩后的下一次请求输入估算。用它立即刷新上下文占用表,而不是
      // 停在压缩前的旧值直到下一次 llm-response。
      const estimated = data.estimatedContextSize as number | undefined;
      return {
        ...state,
        compression: {
          summary: (data.summary as string) ?? '',
          removedCount: (data.removedCount as number) ?? 0,
        },
        ...(typeof estimated === 'number' && estimated > 0 ? { lastInputTokens: estimated } : {}),
      };
    }

    case 'session-cleared': {
      // `/clear` reset the conversation on the backend. Drop every message
      // from the local view (the backend state is already empty). The command
      // echo ("Session cleared.") arrives as a subsequent `token` event, which
      // creates a fresh streaming assistant message via `ensureStreamingMessage`.
      // Also drop conversation-scoped residue: stale sub-agent cards, todo
      // snapshot and token gauges would otherwise outlive the clear. The event
      // log is kept — it is an append-only audit, and the `session-cleared`
      // entry itself lives there. (subAgents is reset by the top-level
      // reducer, which owns that slice.)
      return {
        ...state,
        messages: [],
        compression: undefined,
        activeSkill: null,
        todoList: undefined,
        tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        lastInputTokens: undefined,
        turnTokens: { ...ZERO_TOKENS },
        turnDurationMs: 0,
      };
    }

    // ── Terminal ──
    case 'done': {
      const totalSteps = data.totalSteps as number | undefined;
      const duration = data.duration as number | undefined;
      // done 的 tokens 是整轮累计量(wrangler.rs;colts run() 同理),而每个
      // step 的用量已在 step-end 里累加过 —— 这里再加一次会重复计数。
      // duration/totalSteps 则是权威整轮值,覆盖逐步累加的近似。
      // 轮用量同理:done 的 tokens/duration 是权威整轮值;aborted 的 done
      // (宿主补发,data 里无 tokens/duration)退回 step-end 增量之和。
      const usage = toTurnUsage(
        extractTokens(data) ?? state.turnTokens,
        duration ?? state.turnDurationMs
      );
      return {
        ...state,
        status: 'idle',
        activeSkill: null,
        totalSteps: totalSteps ?? state.totalSteps,
        duration: duration ?? state.duration,
        messages: state.messages.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                status: 'completed' as const,
                blocks: m.blocks ? closeTerminalBlocks(m.blocks, 'completed') : m.blocks,
                ...(usage ? { usage } : {}),
              }
            : m
        ),
      };
    }

    case 'error': {
      const message = (data.message as string) ?? 'Unknown error';
      // No done frame follows an error — the turn's usage is whatever the
      // completed steps consumed (may be nothing, hence optional).
      const usage = toTurnUsage(state.turnTokens, state.turnDurationMs);
      return {
        ...state,
        status: 'error',
        activeSkill: null,
        messages: state.messages.map((m) => {
          if (m.status !== 'streaming') return m;
          // Close open blocks — otherwise thinking/tool blocks keep their
          // streaming pulse forever after a failed run.
          const closed = closeTerminalBlocks(m.blocks ?? [], 'error');
          // The error becomes an in-order block. The old fallback wrote it
          // into `content` only when empty, silently dropping the message
          // whenever the run had already produced text.
          const errorBlock: AgentBlock = {
            id: genBlockId(),
            type: 'error',
            status: 'error',
            content: message,
          };
          return {
            ...m,
            status: 'error' as const,
            blocks: [...closed, errorBlock],
            ...(usage ? { usage } : {}),
          };
        }),
      };
    }

    default:
      return state;
  }
}

// ─── Sub-agent event handlers ─────────────────────────────────────

function reduceSubAgentEvent(
  subAgents: Map<string, SubAgentRunState>,
  eventName: string,
  data: Record<string, unknown>
): Map<string, SubAgentRunState> {
  const subtaskId = (data.subtaskId as string) ?? '';

  switch (eventName) {
    case 'subagent-start': {
      // Create new SubAgentRunState + add subagent block to parent message
      // Note: the block is added to main agent's messages in the top-level reducer
      const subRun: SubAgentRunState = {
        ...createEmptyRunState(),
        status: 'streaming',
        startedAt: Date.now(),
        name: (data.name as string) ?? 'sub-agent',
        task: (data.task as string) ?? '',
        parentBlockId: (data.parentBlockId as string) ?? '',
      };
      return new Map(subAgents).set(subtaskId, subRun);
    }

    case 'subagent-token': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const delta = (data.delta as string) ?? '';
      // Mirror the main token handler: empty frames neither close thinking
      // blocks nor create empty text blocks.
      if (!delta) return subAgents;
      const { run, messageId } = ensureStreamingMessage(sub);
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        ...run,
        messages: run.messages.map((m) => {
          if (m.id !== messageId) return m;
          const blocks = closeThinkingBlocks(m.blocks ?? []);
          const last = blocks[blocks.length - 1];
          // Text segments interleave with thinking/tool blocks in arrival
          // order, exactly like the main agent's token handler.
          if (last?.type === 'text' && last.status === 'streaming') {
            return {
              ...m,
              content: m.content + delta,
              blocks: blocks.map((b) =>
                b.id === last.id ? { ...b, content: b.content + delta } : b
              ),
            };
          }
          const textBlock: AgentBlock = {
            id: genBlockId(),
            type: 'text',
            status: 'streaming',
            content: delta,
          };
          return { ...m, content: m.content + delta, blocks: [...blocks, textBlock] };
        }),
      });
    }

    case 'subagent-thinking': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const content = (data.content as string) ?? '';
      const { run, messageId } = ensureStreamingMessage(sub);
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        ...run,
        messages: run.messages.map((m) => {
          if (m.id !== messageId) return m;
          // Mirror the main thinking handler: an open text segment closes.
          const blocks = closeTextBlocks(m.blocks ?? []);
          const openThinking = blocks.find(
            (b) => b.type === 'thinking' && b.status === 'streaming'
          );
          if (openThinking) {
            return {
              ...m,
              blocks: blocks.map((b) =>
                b.id === openThinking.id ? { ...b, content: b.content + content } : b
              ),
            };
          }
          // Mirror the main-agent guard: an empty first chunk means the model
          // produced no reasoning — never create an empty thinking block.
          if (!content) return m;
          const block: AgentBlock = {
            id: genBlockId(),
            type: 'thinking',
            status: 'streaming',
            content,
          };
          return { ...m, blocks: [...blocks, block] };
        }),
      });
    }

    case 'subagent-tool-start': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const action =
        (data.action as {
          id?: string;
          tool?: string;
          name?: string;
          arguments?: unknown;
          toolType?: string;
        }) ?? {};
      const toolName = action.tool ?? action.name ?? 'unknown';
      const callId = action.id ?? genBlockId();
      const { run, messageId } = ensureStreamingMessage(sub);
      const block: AgentBlock = {
        id: callId,
        type: 'tool_call',
        status: 'streaming',
        content: '',
        metadata: {
          toolName,
          toolArgs: JSON.stringify(action.arguments ?? {}),
          // 与主 agent 的 tool-start 同约定:可选来源字段,仅透传。
          ...(typeof action.toolType === 'string' ? { toolType: action.toolType } : {}),
        },
      };
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeProseBlocks(m.blocks ?? []), block] } : m
        ),
      });
    }

    case 'subagent-tool-end': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const callId = (data.callId as string) ?? '';
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        messages: sub.messages.map((m) => {
          if (!m.blocks) return m;
          // Match by block id (which was set to callId at subagent-tool-start time)
          const target = m.blocks.find((b) => b.id === callId && b.status === 'streaming');
          if (!target) {
            // Fallback: only safe with a single streaming tool_call (parallel
            // calls cannot be disambiguated without callId)
            const streaming = m.blocks.filter(
              (b) => b.type === 'tool_call' && b.status === 'streaming'
            );
            if (streaming.length !== 1) return m;
            return {
              ...m,
              blocks: m.blocks.map((b) =>
                b.id === streaming[0].id
                  ? {
                      ...b,
                      status: 'completed' as const,
                      metadata: { ...b.metadata, toolResult: data.result ?? '' },
                    }
                  : b
              ),
            };
          }
          return {
            ...m,
            blocks: m.blocks.map((b) =>
              b.id === target.id
                ? {
                    ...b,
                    status: 'completed' as const,
                    metadata: { ...b.metadata, toolResult: data.result ?? '' },
                  }
                : b
            ),
          };
        }),
      });
    }

    case 'subagent-end': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const tokens = extractTokens(data);
      const resultStatus = (data.status as SubAgentRunState['resultStatus']) ?? 'success';
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        status: resultStatus === 'error' ? 'error' : 'idle',
        resultStatus,
        error: data.error as string | undefined,
        totalSteps: data.totalSteps as number | undefined,
        tokens: tokens ?? sub.tokens,
        duration: (data.duration as number) ?? sub.duration,
        messages: sub.messages.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                status: 'completed' as const,
                blocks: m.blocks ? closeAllBlocks(m.blocks) : m.blocks,
              }
            : m
        ),
      });
    }

    default:
      return subAgents;
  }
}

// ─── Top-level reducer ────────────────────────────────────────────

/**
 * Pure reducer function: (state, event) → new state.
 *
 * Routes subagent-* events to the sub-agent state machine, everything else
 * to the main agent. Always appends to the event log.
 */
export function reducer(state: SessionRunState, sse: SSEEvent): SessionRunState {
  const eventName = sse.event;
  const data = sse.data;

  // Append to event log (capped at MAX_EVENT_LOG entries)
  const logEntry = toEventLog(eventName, data);

  // Route to sub-agent or main
  if (eventName === 'subagent-start') {
    // Create sub-agent + add block to parent main message
    // Generate a subtaskId when the daemon omits it: using '' as the Map key
    // makes two such sub-agents overwrite each other, and the parent block
    // could never be matched by subagent-end.
    const subtaskId = (data.subtaskId as string) ?? genBlockId();
    const blockId = genBlockId();
    const { run: mainWithBlock } = (() => {
      const { run, messageId } = ensureStreamingMessage(state.main);
      const block: AgentBlock = {
        id: blockId,
        type: 'subagent',
        status: 'streaming',
        content: '',
        metadata: {
          subtaskId,
          name: data.name ?? '',
          task: data.task ?? '',
        },
      };
      return {
        run: {
          ...run,
          messages: run.messages.map((m) =>
            m.id === messageId ? { ...m, blocks: [...closeProseBlocks(m.blocks ?? []), block] } : m
          ),
        },
      };
    })();

    const subData = { ...data, subtaskId, parentBlockId: blockId };
    const subAgents = reduceSubAgentEvent(state.subAgents, 'subagent-start', subData);

    return {
      main: mainWithBlock,
      subAgents,
      events: appendEvent(state.events, logEntry),
    };
  }

  if (isSubAgentEvent(eventName)) {
    const subAgents = reduceSubAgentEvent(state.subAgents, eventName, data);

    // For subagent-end, also update the parent block status
    let main = state.main;
    if (eventName === 'subagent-end') {
      const subtaskId = (data.subtaskId as string) ?? '';
      const sub = subAgents.get(subtaskId);
      if (sub) {
        main = {
          ...main,
          messages: main.messages.map((m) => {
            if (!m.blocks) return m;
            return {
              ...m,
              blocks: m.blocks.map((b) => {
                if (b.type !== 'subagent' || b.metadata?.subtaskId !== subtaskId) return b;
                return {
                  ...b,
                  status:
                    sub.resultStatus === 'error' ? ('error' as const) : ('completed' as const),
                  metadata: {
                    ...b.metadata,
                    resultStatus: sub.resultStatus,
                    steps: sub.totalSteps,
                    // Flat token fields — the shape SubAgentBlockMetadata
                    // declares and the chat UI reads (inputTokens/outputTokens).
                    inputTokens: sub.tokens.input,
                    outputTokens: sub.tokens.output,
                    duration: sub.duration,
                    error: sub.error,
                    // Full sub-run conversation for the SubAgentModal.
                    // AgentMessage is structurally compatible with chat's
                    // Message (same role/content/status/createdAt shape).
                    messages: sub.messages,
                  },
                };
              }),
            };
          }),
        };
      }
    }

    return {
      main,
      subAgents,
      events: appendEvent(state.events, logEntry),
    };
  }

  // Main agent event
  const main = reduceMainEvent(state.main, eventName, data);
  return {
    main,
    // `/clear` wipes the conversation — sub-agent runs belong to it
    subAgents: eventName === 'session-cleared' ? new Map() : state.subAgents,
    events: appendEvent(state.events, logEntry),
  };
}
