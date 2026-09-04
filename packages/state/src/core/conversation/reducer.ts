/**
 * @fileoverview Core reducer — SSE event → SessionRunState
 *
 * Pure function: (state, event) → state.
 * Every event first passes through normalizeEvent (wire variants → canonical
 * shape), then routes to the main agent or a sub-agent run — sub-agent content
 * events are normalized to the main event shape, so both run kinds share one
 * set of block handlers (single block semantics).
 */

import {
  SKILL_TOOL,
  textBlock,
  thinkingBlock,
  errorBlock,
  skillBlock,
  completeSkillBlock,
  toolCallBlock,
  completeToolCallBlock,
  humanInputBlock,
  subagentBlock,
  todoBlock,
  a2uiBlock,
  appendA2uiLines,
  resolveA2uiCall,
  PRESENTED_TOOLS,
} from './blocks.js';
import { A2UI_TOOLS, applyA2uiCall, a2uiBlockOpeningLines } from './a2ui.js';
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

let idCounter = 0;
/**
 * One scheme for every live-side id (blocks, messages, markers):
 * prefix + timestamp + counter + random (the random suffix guards the
 * same-millisecond multi-reducer-instance case, e.g. two sessions in one
 * page). History-rebuilt entities keep their own `hist-` ids in
 * fromHistory on purpose — provenance you can see while debugging, and
 * `hist-${tc.id}` blocks keep stable React keys across reloads.
 */
function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Message-array update helpers ─────────────────────────────────

/**
 * Update the message with the given id. The target is virtually always the
 * tail (the streaming bubble), so check that first; fall back to a scan for
 * the rare mid-conversation target.
 */
function updateMessageById(
  messages: AgentMessage[],
  id: string,
  update: (m: AgentMessage) => AgentMessage
): AgentMessage[] {
  let idx = messages.length - 1;
  if (messages[idx]?.id !== id) {
    idx = messages.findIndex((m) => m.id === id);
  }
  if (idx < 0) return messages;
  const next = [...messages];
  next[idx] = update(messages[idx]);
  return next;
}

/**
 * Update (scanning from the tail) the first message whose blocks contain a
 * match; no match → array returned unchanged. Block-targeting events
 * (tool-end, skill-*, human-input-resolved, subagent-end's parent sync)
 * almost always hit the live bubble — but NOT necessarily the last MESSAGE:
 * an auto-compaction system marker can trail the bubble mid-turn. Reverse
 * scan stays correct in that case while skipping the rest of the history.
 */
function updateMessageWithBlock(
  messages: AgentMessage[],
  pred: (b: AgentBlock) => boolean,
  update: (m: AgentMessage) => AgentMessage
): AgentMessage[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m.blocks?.some(pred)) continue;
    const next = [...messages];
    next[i] = update(m);
    return next;
  }
  return messages;
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
    id: genId('msg'),
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
        id: genId('user'),
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
        id: genId('msg'),
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
        id: genId('sys'),
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
        messages: updateMessageById(run.messages, messageId, (m) => {
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
          const newTextBlock = textBlock(genId('blk'), delta, 'streaming');
          return { ...m, content: m.content + delta, blocks: [...blocks, newTextBlock] };
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
        messages: updateMessageById(run.messages, messageId, (m) => {
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
          return { ...m, blocks: [...blocks, thinkingBlock(genId('blk'), content, 'streaming')] };
        }),
      };
    }

    // ── Tool calls ──
    case 'tool-start': {
      const { run, messageId } = ensureStreamingMessage(state);
      // 终态闩:轮已关闭,迟到的 tool-start 帧直接丢弃。
      if (!messageId) return state;
      const toolName = (data.name as string) ?? 'unknown';
      const callId = (data.id as string) ?? genId('blk');
      // 自带表现块的工具(PRESENTED_TOOLS,见 blocks.ts)不渲染 tool_call 块:
      // 问答卡/todo 卡随后由各自的专用事件(human-input / todo-list)追加,
      // 与 fromHistory 的跳过同构。气泡与 prose 收拢照常,保证后续表现块
      // 的锚点与常规路径一致。
      if (PRESENTED_TOOLS.has(toolName)) {
        return {
          ...run,
          messages: updateMessageById(run.messages, messageId, (m) => ({
            ...m,
            blocks: closeProseBlocks(m.blocks ?? []),
          })),
        };
      }
      // a2ui_* 特判:surface 数据全在工具 args 里(后端纯 ack,无专用事件),
      // 在此物化成 genui 协议行并按 surfaceId 聚合成块;args 不可用时返回
      // null,落回下方普通 tool_call 块(降级,不丢调用)。
      if (A2UI_TOOLS.has(toolName)) {
        const res = applyA2uiCall(run.a2uiSurfaces, toolName, data.args);
        if (res) {
          return {
            ...run,
            a2uiSurfaces: res.surfaces,
            messages: updateMessageById(run.messages, messageId, (m) => {
              const blocks = m.blocks ?? [];
              const idx = blocks.findIndex(
                (b) => b.type === 'a2ui' && b.metadata?.surfaceId === res.surfaceId
              );
              if (idx >= 0) {
                const next = [...blocks];
                next[idx] = appendA2uiLines(blocks[idx], res.lines, callId, res.title);
                return { ...m, blocks: next };
              }
              const content = [...a2uiBlockOpeningLines(toolName, res), ...res.lines].join('\n');
              const a2ui = a2uiBlock({
                id: genId('a2ui'),
                surfaceId: res.surfaceId,
                content,
                status: 'streaming',
                title: res.title,
                callId,
              });
              return { ...m, blocks: [...closeProseBlocks(blocks), a2ui] };
            }),
          };
        }
      }
      // load_skill 与 fromHistory 的 SKILL_TOOL 特判同构：实时也展示为 skill 块。
      // 块语义 = 一次工具调用:tool-start 建块(streaming),tool-end 收尾;
      // task 取自工具参数,没有独立的技能生命周期事件。
      const block: AgentBlock =
        toolName === SKILL_TOOL
          ? skillBlock({
              id: callId,
              skillName: (data.args as { name?: string } | undefined)?.name ?? '',
              task: (data.args as { task?: string } | undefined)?.task,
              status: 'streaming',
            })
          : toolCallBlock({
              id: callId,
              toolName,
              args: data.args,
              toolType: data.toolType,
              status: 'streaming',
            });
      return {
        ...run,
        messages: updateMessageById(run.messages, messageId, (m) => ({
          ...m,
          blocks: [...closeProseBlocks(m.blocks ?? []), block],
        })),
      };
    }

    case 'tool-end': {
      const callId = (data.callId as string) ?? '';
      // a2ui 聚合块按 metadata.pendingCallIds 配对(块 id 是 surface 级,
      // 不是 callId);命中即收尾。未命中(a2ui 调用走了降级路径)时
      // updateMessageWithBlock 原样返回数组,落回下方按块 id 的通用配对。
      const isA2uiPending = (b: AgentBlock) =>
        b.type === 'a2ui' &&
        Array.isArray(b.metadata?.pendingCallIds) &&
        (b.metadata.pendingCallIds as string[]).includes(callId);
      const a2uiMessages = updateMessageWithBlock(state.messages, isA2uiPending, (m) => ({
        ...m,
        blocks: (m.blocks ?? []).map((b) => (isA2uiPending(b) ? resolveA2uiCall(b, callId) : b)),
      }));
      if (a2uiMessages !== state.messages) {
        return { ...state, messages: a2uiMessages };
      }
      // Match by block id (set to callId at tool-start time). Both daemons
      // emit callId unconditionally and old sessions load via fromHistory —
      // there is no sender left that needs the historical sole-streaming
      // fallback, so a callId that matches nothing is simply a no-op.
      return {
        ...state,
        messages: updateMessageWithBlock(
          state.messages,
          (b) => b.id === callId && b.status === 'streaming',
          (m) => ({
            ...m,
            blocks: (m.blocks ?? []).map((b) => {
              if (b.id !== callId) return b;
              // load_skill 块按 skill 语义收尾，终态与 fromHistory 一致
              if (b.type === 'skill') {
                const resultStr =
                  typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
                return completeSkillBlock(b, resultStr);
              }
              return completeToolCallBlock(b, data.result);
            }),
          })
        ),
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
      // Always assign a requestId: without one, a later human-input-resolved
      // could never match (block stays pending forever), and two resolved
      // events both missing requestId would mass-complete every block
      // (undefined === undefined).
      const requestId = (data.requestId as string) ?? genId('blk');
      const block = humanInputBlock({
        id: requestId,
        requestId,
        questions,
        context: data.context,
        status: 'pending',
      });
      return {
        ...run,
        messages: updateMessageById(run.messages, messageId, (m) => ({
          ...m,
          blocks: [...closeProseBlocks(m.blocks ?? []), block],
        })),
      };
    }

    case 'human-input-resolved': {
      const reqId = data.requestId as string | undefined;
      // No requestId means we cannot identify which block to resolve —
      // matching everything would complete unrelated pending blocks.
      if (!reqId) return state;
      return {
        ...state,
        messages: updateMessageWithBlock(
          state.messages,
          (b) => b.type === 'human_input' && b.metadata?.requestId === reqId,
          (m) => ({
            ...m,
            blocks: (m.blocks ?? []).map((b) =>
              b.type === 'human_input' && b.metadata?.requestId === reqId
                ? {
                    ...b,
                    status: 'completed' as const,
                    metadata: { ...b.metadata, response: data.response },
                  }
                : b
            ),
          })
        ),
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
      // 单例内联卡的锚点规则:永远挂在最后一条 assistant 消息末尾——与
      // fromHistory 同一锚点,"resume 不重排布局"对 todo 卡也成立。轮内
      // 更新即原地(宿主本就是末条 assistant);跨轮收到非空清单时把卡片
      // 移动过去(不复制、不累积);空清单只原地更新/记 state,不挪动。
      const existing = findTodoBlock(state.messages);
      let lastAssistantIdx = -1;
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].role === 'assistant') {
          lastAssistantIdx = i;
          break;
        }
      }

      if (existing) {
        const hostIdx = state.messages.findIndex((m) => m.id === existing.messageId);
        const shouldMove =
          todoList.items.length > 0 && lastAssistantIdx >= 0 && hostIdx !== lastAssistantIdx;
        if (!shouldMove) {
          return {
            ...state,
            todoList,
            messages: updateMessageById(state.messages, existing.messageId, (m) => ({
              ...m,
              blocks: (m.blocks ?? []).map((b) =>
                b.id === existing.blockId
                  ? { ...b, metadata: { ...b.metadata, items: todoList.items } }
                  : b
              ),
            })),
          };
        }
        // Move the singleton card to the newest turn's bubble.
        const host = state.messages[hostIdx];
        const card = (host.blocks ?? []).find((b) => b.id === existing.blockId);
        // Defensive: findTodoBlock/host index skew — record the snapshot only.
        if (!card) return { ...state, todoList };
        const moved: AgentBlock = {
          ...card,
          status: state.status === 'streaming' ? 'streaming' : 'completed',
          metadata: { ...card.metadata, items: todoList.items },
        };
        return {
          ...state,
          todoList,
          messages: state.messages.map((m, idx) => {
            if (idx === hostIdx) {
              return { ...m, blocks: (m.blocks ?? []).filter((b) => b.id !== existing.blockId) };
            }
            if (idx === lastAssistantIdx) {
              return { ...m, blocks: [...(m.blocks ?? []), moved] };
            }
            return m;
          }),
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
        const card = todoBlock(genId('blk'), todoList.items, 'completed');
        if (lastAssistantIdx >= 0) {
          const messages = state.messages.map((m, idx) =>
            idx === lastAssistantIdx ? { ...m, blocks: [...(m.blocks ?? []), card] } : m
          );
          return { ...state, todoList, messages };
        }
        return { ...state, todoList };
      }
      const { run, messageId } = ensureStreamingMessage(state);
      // Defensive: status/turnClosed skew — record the snapshot, don't attach.
      if (!messageId) return { ...state, todoList };
      const card = todoBlock(genId('blk'), todoList.items, 'streaming');
      return {
        ...run,
        todoList,
        messages: updateMessageById(run.messages, messageId, (m) => ({
          ...m,
          blocks: [...(m.blocks ?? []), card],
        })),
      };
    }

    // ── Step lifecycle ──
    case 'step-start': {
      // 多轮流(events 常驻接口):done 扣闩后的 step-start 是新一轮
      // (消费轮/后台轮——没有用户消息开路,turnClosed 闩会把帧全部
      // 丢弃)。判别式:只有 step===0(新轮首步)才重开——流是 FIFO,
      // 同轮迟到的 step>0 不重开(僵尸气泡面缩到零)。重开是惰性的:
      // 只翻状态清账,不预铺气泡,首个内容帧经 ensureStreamingMessage
      // 开泡(空轮不留空壳)。
      const run = state.turnClosed && (data.step as number) === 0 ? reopenTurn(state) : state;
      return { ...run, stepCount: (data.step as number) ?? run.stepCount + 1 };
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
      // HITL 中断终态(wrangler-daemon):done{type:"waiting_human"} 表示
      // "run 正常结束、暂停等人类回答" —— 待答的 human_input 块必须保持
      // pending(交互入口还在),只有普通终态才关闭它们。
      const waitingHuman = data.type === 'waiting_human';
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
        totalSteps: totalSteps ?? state.totalSteps,
        duration: duration ?? state.duration,
        messages: state.messages.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                status: 'completed' as const,
                blocks: m.blocks
                  ? waitingHuman
                    ? closeAllBlocks(m.blocks)
                    : closeTerminalBlocks(m.blocks, 'completed')
                  : m.blocks,
                ...(usage ? { usage } : {}),
              }
            : m
        ),
      };
    }

    // ── HITL continuation (host-synthesized) ──
    case 'run-resumed': {
      return reopenTurn(state);
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
        messages: state.messages.map((m) => {
          if (m.status !== 'streaming') return m;
          // Close open blocks — otherwise thinking/tool blocks keep their
          // streaming pulse forever after a failed run.
          const closed = closeTerminalBlocks(m.blocks ?? [], 'error');
          // The error becomes an in-order block. The old fallback wrote it
          // into `content` only when empty, silently dropping the message
          // whenever the run had already produced text.
          return {
            ...m,
            status: 'error' as const,
            blocks: [...closed, errorBlock(genId('blk'), message)],
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

/// done/error 扣闩(turnClosed)之后重开一轮:翻回 streaming、清闩、
/// 清零本轮用量账目。run-resumed(宿主合成)与 step-start-after-done
/// (多轮流:消费轮/后台轮)共用。**惰性**:不预铺空气泡——首个内容
/// 帧(token/thinking)经 ensureStreamingMessage 开泡,迟到的杂帧最多
/// 翻一下状态,不再制造永久打字的僵尸气泡。
function reopenTurn(state: AgentRunState): AgentRunState {
  return {
    ...state,
    status: 'streaming',
    turnClosed: false,
    turnTokens: { ...ZERO_TOKENS },
    turnDurationMs: 0,
  };
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
    // 会话级路由(与 delivery 同款):后台子女的 start 可能晚于主轮
    // done——排队等并发闸门的子女恰在主轮结束后才起飞。主轮已闩则
    // 惰性重开一个后台轮容器,子块照常挂载;不再整帧丢弃(丢弃会让
    // 该子女的后续帧因 lookup miss 全部静默蒸发)。
    const base = state.main.turnClosed ? reopenTurn(state.main) : state.main;
    // Create sub-agent + add block to parent main message
    // Generate a subtaskId when the daemon omits it: using '' as the Map key
    // makes two such sub-agents overwrite each other, and the parent block
    // could never be matched by subagent-end.
    const subtaskId = (data.subtaskId as string) ?? genId('blk');
    const blockId = genId('blk');
    const { run: mainWithBlock } = (() => {
      const { run, messageId } = ensureStreamingMessage(base);
      // turnClosed 已在上方重开——messageId 必非空;守卫只为类型诚实。
      if (!messageId) return { run };
      const block = subagentBlock({
        id: blockId,
        subtaskId,
        name: data.name,
        task: data.task,
        status: 'streaming',
      });
      return {
        run: {
          ...run,
          messages: updateMessageById(run.messages, messageId, (m) => ({
            ...m,
            blocks: [...closeProseBlocks(m.blocks ?? []), block],
          })),
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

  if (eventName === 'delivery') {
    // 异步委派投递回执(wrangler 的 delivery 事件):子任务结果已进主
    // 会话邮箱。给子运行与父块都打"已送达"标记——异步模式下子块不
    // 再以"工具结果形式"收尾,受理与送达是两个独立信号。
    // delivery 不带 subagent- 前缀,normalizeEvent 不提取 subtaskId,
    // 直接从载荷里取。
    const id = (data.subtaskId as string) ?? '';
    const sub = state.subAgents.get(id);
    if (!sub) return state;
    const subAgents = new Map(state.subAgents).set(id, {
      ...sub,
      delivered: true,
      deliveryStatus: data.status as string | undefined,
      deliveryContent: data.content as string | undefined,
    });
    const main = {
      ...state.main,
      messages: updateMessageWithBlock(
        state.main.messages,
        (b) => b.type === 'subagent' && b.metadata?.subtaskId === id,
        (m) => ({
          ...m,
          blocks: (m.blocks ?? []).map((b) => {
            if (b.type !== 'subagent' || b.metadata?.subtaskId !== id) return b;
            return { ...b, metadata: { ...b.metadata, delivered: true } };
          }),
        })
      ),
    };
    return { main, subAgents };
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
        messages: updateMessageWithBlock(
          main.messages,
          (b) => b.type === 'subagent' && b.metadata?.subtaskId === id,
          (m) => ({
            ...m,
            blocks: (m.blocks ?? []).map((b) => {
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
          })
        ),
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
