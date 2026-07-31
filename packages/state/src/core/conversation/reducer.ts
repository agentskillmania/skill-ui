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
  SubAgentRunState,
} from './types.js';
import { createEmptyRunState } from './types.js';
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
    case 'phase-change':
      return `Phase: → ${(data.to as { type?: string })?.type ?? ''}`;
    case 'compressing':
      return 'Compressing context';
    case 'compressed':
      return `Compressed: -${data.removedCount ?? 0} messages`;
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
  const t = data.tokens as Partial<TokenStats> | undefined;
  if (!t) return undefined;
  return {
    input: t.input ?? 0,
    output: t.output ?? 0,
    cacheRead: t.cacheRead ?? 0,
    cacheWrite: t.cacheWrite ?? 0,
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

/** Close any open thinking block on a message */
function closeOpenBlocks(blocks: AgentBlock[]): AgentBlock[] {
  return blocks.map((b) => (b.status === 'streaming' ? { ...b, status: 'completed' as const } : b));
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
      const userMsg: AgentMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: 'user',
        content: (data.content as string) ?? '',
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
      return { ...state, messages: [...state.messages, userMsg, pendingAssistant] };
    }

    // ── Streaming tokens ──
    case 'token': {
      const { run, messageId } = ensureStreamingMessage(state);
      const delta = (data.delta as string) ?? '';
      return {
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: m.content + delta,
                blocks: m.blocks ? closeOpenBlocks(m.blocks) : m.blocks,
              }
            : m
        ),
      };
    }

    case 'thinking': {
      const { run, messageId } = ensureStreamingMessage(state);
      const content = (data.content as string) ?? '';
      return {
        ...run,
        messages: run.messages.map((m) => {
          if (m.id !== messageId) return m;
          const blocks = m.blocks ?? [];
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
      const block: AgentBlock = {
        id: callId,
        type: 'tool_call',
        status: 'streaming',
        content: '',
        metadata: {
          toolName,
          toolArgs: JSON.stringify(data.args ?? {}),
        },
      };
      return {
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeOpenBlocks(m.blocks ?? []), block] } : m
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
            // Fallback: match first streaming tool_call (backward compat)
            const fallback = m.blocks.find(
              (b) => b.type === 'tool_call' && b.status === 'streaming'
            );
            if (!fallback) return m;
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
            blocks: m.blocks.map((b) =>
              b.id === callId
                ? {
                    ...b,
                    status: 'completed' as const,
                    metadata: { ...b.metadata, toolResult: data.result ?? '' },
                  }
                : b
            ),
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
          m.id === messageId ? { ...m, blocks: [...closeOpenBlocks(m.blocks ?? []), block] } : m
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
      const block: AgentBlock = {
        id: (data.requestId as string) ?? genBlockId(),
        type: 'human_input',
        status: 'pending',
        content: '',
        metadata: {
          requestId: data.requestId,
          inputType,
          title: data.context ?? 'AI needs your input',
          message: questions.map((q) => q.question).join('\n'),
          options,
        },
      };
      return {
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeOpenBlocks(m.blocks ?? []), block] } : m
        ),
      };
    }

    case 'human-input-resolved': {
      const reqId = data.requestId as string;
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
        },
      };
    }

    case 'llm-response': {
      const tokens = extractTokens(data);
      return {
        ...state,
        tokens: tokens ? addTokens(state.tokens, tokens) : state.tokens,
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
      };
    }

    // ── Compression ──
    case 'compressing': {
      return state;
    }

    case 'compressed': {
      return {
        ...state,
        compression: {
          summary: (data.summary as string) ?? '',
          removedCount: (data.removedCount as number) ?? 0,
        },
      };
    }

    // ── Terminal ──
    case 'done': {
      const tokens = extractTokens(data);
      const totalSteps = data.totalSteps as number | undefined;
      const duration = data.duration as number | undefined;
      return {
        ...state,
        status: 'idle',
        tokens: tokens ? addTokens(state.tokens, tokens) : state.tokens,
        totalSteps: totalSteps ?? state.totalSteps,
        duration: duration ?? state.duration,
        messages: state.messages.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                status: 'completed' as const,
                blocks: m.blocks ? closeOpenBlocks(m.blocks) : m.blocks,
              }
            : m
        ),
      };
    }

    case 'error': {
      return {
        ...state,
        status: 'error',
        messages: state.messages.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                status: 'error' as const,
                content: m.content || `Error: ${data.message ?? 'Unknown error'}`,
              }
            : m
        ),
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
      const { run } = ensureStreamingMessage(sub);
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        ...run,
        messages: run.messages.map((m) =>
          m.status === 'streaming' && m.role === 'assistant'
            ? { ...m, content: m.content + delta }
            : m
        ),
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
          const blocks = m.blocks ?? [];
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
        (data.action as { id?: string; tool?: string; name?: string; arguments?: unknown }) ?? {};
      const toolName = action.tool ?? action.name ?? 'unknown';
      const callId = action.id ?? genBlockId();
      const { run, messageId } = ensureStreamingMessage(sub);
      const block: AgentBlock = {
        id: callId,
        type: 'tool_call',
        status: 'streaming',
        content: '',
        metadata: { toolName, toolArgs: JSON.stringify(action.arguments ?? {}) },
      };
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        ...run,
        messages: run.messages.map((m) =>
          m.id === messageId ? { ...m, blocks: [...closeOpenBlocks(m.blocks ?? []), block] } : m
        ),
      });
    }

    case 'subagent-tool-end': {
      const sub = subAgents.get(subtaskId);
      if (!sub) return subAgents;
      return new Map(subAgents).set(subtaskId, {
        ...sub,
        messages: sub.messages.map((m) => {
          if (!m.blocks) return m;
          const target = m.blocks.find((b) => b.type === 'tool_call' && b.status === 'streaming');
          if (!target) return m;
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
                blocks: m.blocks ? closeOpenBlocks(m.blocks) : m.blocks,
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

  // Append to event log (lossless — one entry per event)
  const logEntry = toEventLog(eventName, data);

  // Route to sub-agent or main
  if (eventName === 'subagent-start') {
    // Create sub-agent + add block to parent main message
    const blockId = genBlockId();
    const { run: mainWithBlock } = (() => {
      const { run, messageId } = ensureStreamingMessage(state.main);
      const block: AgentBlock = {
        id: blockId,
        type: 'subagent',
        status: 'streaming',
        content: '',
        metadata: {
          subtaskId: data.subtaskId ?? '',
          name: data.name ?? '',
          task: data.task ?? '',
        },
      };
      return {
        run: {
          ...run,
          messages: run.messages.map((m) =>
            m.id === messageId ? { ...m, blocks: [...closeOpenBlocks(m.blocks ?? []), block] } : m
          ),
        },
      };
    })();

    const subData = { ...data, parentBlockId: blockId };
    const subAgents = reduceSubAgentEvent(state.subAgents, 'subagent-start', subData);

    return {
      main: mainWithBlock,
      subAgents,
      events: [...state.events, logEntry],
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
                    tokens: sub.tokens,
                    duration: sub.duration,
                    error: sub.error,
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
      events: [...state.events, logEntry],
    };
  }

  // Main agent event
  const main = reduceMainEvent(state.main, eventName, data);
  return {
    main,
    subAgents: state.subAgents,
    events: [...state.events, logEntry],
  };
}
