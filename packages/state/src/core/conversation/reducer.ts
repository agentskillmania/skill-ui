/**
 * @fileoverview Core reducer — SSE event → SessionRunState
 *
 * Pure function: (state, event) → state.
 * Every event first passes through normalizeEvent (wire variants → canonical
 * shape), then routes to the main agent or a sub-agent run — sub-agent content
 * events are normalized to the main event shape, so both run kinds share one
 * set of block handlers (single block semantics).
 */

import { normalizeEvent } from './normalize.js';
import type {
  SessionRunState,
  AgentRunState,
  AgentMessage,
  AgentBlock,
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

/** Read the canonical TokenStats off a normalized event (normalizeEvent has
 * already folded the daemons' casing variants — see normalize.ts). */
function extractTokens(data: Record<string, unknown>): TokenStats | undefined {
  const t = data.tokens as Partial<TokenStats> | undefined;
  if (!t) return undefined;
  return {
    input: t.input ?? 0,
    output: t.output ?? 0,
    cacheRead: t.cacheRead ?? 0,
    cacheWrite: t.cacheWrite ?? 0,
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

/**
 * Find the current streaming assistant message in a run state, or create one.
 *
 * TERMINAL GUARD: when `run.turnClosed` is set (this reducer consumed a
 * `done`/`error` since the last turn opened), refuse to open a new stream —
 * `messageId` comes back null and every caller drops its event. Without this,
 * any frame arriving after the terminal event (the daemons merge channels
 * without cross-channel ordering guarantees) opened a zombie bubble that
 * streams forever: blinking cursor, no action buttons, no closing event ever
 * coming. Do NOT re-derive "closed" from message shape here — a state rebuilt
 * by fromHistory mid-run is shape-identical to a post-done state, yet must
 * stay open-able for the live event tail (see types.ts `turnClosed`).
 *
 * Creating the bubble also flips `status` to 'streaming' (a turn is open).
 */
function ensureStreamingMessage(run: AgentRunState): {
  run: AgentRunState;
  messageId: string | null;
} {
  if (run.turnClosed) {
    return { run, messageId: null };
  }
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
    run: { ...run, status: 'streaming', messages: [...msgs, newMsg] },
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
      // It also clears the terminal latch — this is the only way a turn
      // re-opens after done/error.
      return {
        ...state,
        status: 'streaming',
        turnClosed: false,
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
      // 终态闩:轮已关闭,迟到的 token 帧直接丢弃(不开僵尸气泡)。
      if (!messageId) return state;
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
      // 终态闩:轮已关闭,迟到的 thinking 帧直接丢弃。
      if (!messageId) return state;
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
      // 终态闩:轮已关闭,迟到的 tool-start 帧直接丢弃。
      if (!messageId) return state;
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
      // 终态闩:轮已关闭,迟到的 skill-loading 帧直接丢弃。
      if (!messageId) return state;
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
      // 终态闩:轮已关闭,迟到的 human-input 帧直接丢弃(轮外弹出的交互
      // 输入无人作答,块会永远 pending)。
      if (!messageId) return state;
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
      // 附着决策读两个显式信号,各管一件事(不再从消息形状推断):
      // - status === 'streaming'(有活气泡)才走流式挂载;光秃 todo-list
      //   落在 fresh/resting 状态时不得独自开出流式块,快照仍记进
      //   state.todoList 供侧栏渲染。
      // - 迟到的非空清单(daemon 步进循环在末步后才 diff 快照,该事件走
      //   event_tx 广播通道,与 runner 自己的 done 帧无合流顺序保证)在
      //   终态后绝不新开流——turnClosed 闩已把 ensureStreamingMessage 的
      //   创建路径焊死,这里以 completed 块附到末条 assistant 即可。
      if (state.status !== 'streaming') {
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
      // Defensive: status/turnClosed skew — record the snapshot, don't attach.
      if (!messageId) return { ...state, todoList };
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
      // creates a fresh streaming assistant message via `ensureStreamingMessage`
      // — so the terminal latch and status must reset here, or that echo
      // would be dropped as a late frame. Also drop conversation-scoped
      // residue: stale sub-agent cards, todo snapshot and token gauges would
      // otherwise outlive the clear. (subAgents is reset by the top-level
      // reducer, which owns that slice.)
      return {
        ...state,
        status: 'idle',
        turnClosed: false,
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
        turnClosed: true,
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
        turnClosed: true,
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

/**
 * Sub-agent lifecycle handlers: subagent-start (create run) and subagent-end
 * (summary + latch). Content events (token/thinking/tool-start/tool-end)
 * never reach here — normalizeEvent rewrites them to the main event shape and
 * the top-level reducer drives the sub-run through reduceMainEvent directly.
 */
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

    case 'subagent-end': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      const tokens = extractTokens(data);
      const resultStatus = (data.status as SubAgentRunState['resultStatus']) ?? 'success';
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        status: resultStatus === 'error' ? 'error' : 'idle',
        // 上闩:此后迟到的 subagent-token/thinking/tool-start 一律丢弃。
        turnClosed: true,
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
 * Step 0 normalizes the wire frame (normalizeEvent). Sub-agent lifecycle
 * events (subagent-start/end) get their own handlers; sub-agent CONTENT
 * events arrive already normalized to the main event shape and are driven
 * through reduceMainEvent on the sub-run — one block semantics for both.
 */
export function reducer(state: SessionRunState, sse: SSEEvent): SessionRunState {
  const { event: eventName, data, subtaskId } = normalizeEvent(sse);

  // Route to sub-agent or main
  if (eventName === 'subagent-start') {
    // 终态闩:主 run 的轮已关闭时,迟到的 subagent-start 整帧丢弃——开了
    // sub-run 却没有活气泡挂载父块,卡片会永远 spinning。
    if (state.main.turnClosed) return state;
    // Create sub-agent + add block to parent main message
    // Generate a subtaskId when the daemon omits it: using '' as the Map key
    // makes two such sub-agents overwrite each other, and the parent block
    // could never be matched by subagent-end.
    const subtaskId = (data.subtaskId as string) ?? genBlockId();
    const blockId = genBlockId();
    const { run: mainWithBlock } = (() => {
      const { run, messageId } = ensureStreamingMessage(state.main);
      // turnClosed checked above — messageId is always non-null here.
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
    };
  }

  if (eventName === 'subagent-end') {
    const subAgents = reduceSubAgentEvent(state.subAgents, eventName, data);

    // Also update the parent block status
    let main = state.main;
    const id = subtaskId ?? '';
    const sub = subAgents.get(id);
    if (sub) {
      main = {
        ...main,
        messages: main.messages.map((m) => {
          if (!m.blocks) return m;
          return {
            ...m,
            blocks: m.blocks.map((b) => {
              if (b.type !== 'subagent' || b.metadata?.subtaskId !== id) return b;
              return {
                ...b,
                status: sub.resultStatus === 'error' ? ('error' as const) : ('completed' as const),
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

    return {
      main,
      subAgents,
    };
  }

  // Sub-agent content event (normalized to the main event shape): drive the
  // sub-run through the SAME handlers as the main run — one block semantics.
  // SubAgentRunState extends AgentRunState; the handlers' spreads carry the
  // sub-specific fields (name/task/parentBlockId/resultStatus) along.
  if (subtaskId !== undefined) {
    const sub = state.subAgents.get(subtaskId);
    if (!sub) return state;
    const next = reduceMainEvent(sub, eventName, data) as SubAgentRunState;
    return { ...state, subAgents: new Map(state.subAgents).set(subtaskId, next) };
  }

  // Main agent event
  const main = reduceMainEvent(state.main, eventName, data);
  return {
    main,
    // `/clear` wipes the conversation — sub-agent runs belong to it
    subAgents: eventName === 'session-cleared' ? new Map() : state.subAgents,
  };
}
