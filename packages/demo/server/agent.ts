/**
 * wrangler agent session management
 *
 * Uses EnhancedRunner.run() + runner.on() for event-driven SSE streaming.
 * All colts RunnerEventMap events are forwarded to the client — no drops.
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { LLMClient } from '@agentskillmania/llm-client';
import { EnhancedRunner } from '@agentskillmania/wrangler';
import { createAgentState, addUserMessage } from '@agentskillmania/colts';
import type {
  AgentState,
  HumanResponse,
  AskHumanHandler as AskHumanHandlerType,
} from '@agentskillmania/colts';
import type { Response } from 'express';
import type { AgentSessionOptions } from './types.js';

/** SSE event payload */
export interface SSEEvent {
  event: string;
  data: unknown;
}

/**
 * Shared bridge between askHumanHandler closure and AgentSession instance.
 * The handler is created before the session exists, so we use this object
 * as a mutable indirection layer.
 */
interface AskHumanBridge {
  sseSender: ((event: SSEEvent) => void) | null;
  cockpitSender: ((event: SSEEvent) => void) | null;
  pendingHumanInput: Map<
    string,
    { resolve: (value: HumanResponse) => void; reject: (reason?: unknown) => void }
  >;
}

/**
 * Single agent session backed by wrangler EnhancedRunner.
 *
 * Events flow: colts RunnerEventMap → mapEvent() → SSEEvent → pushEvent() → SSE stream.
 * The same events are forwarded to both the chat SSE stream and the cockpit SSE stream.
 */
export class AgentSession {
  readonly sessionId: string;
  readonly workspacePath: string;
  readonly agentName: string;
  readonly model: string;

  private runner: EnhancedRunner;
  private state: AgentState;
  private abortController: AbortController | null = null;

  /** Shared bridge with askHumanHandler */
  private bridge: AskHumanBridge;

  /** Async event queue */
  private eventQueue: SSEEvent[] = [];
  private eventWaiters: Array<(event: SSEEvent | null) => void> = [];

  private pushEvent(event: SSEEvent): void {
    // Forward to cockpit stream if connected
    this.bridge.cockpitSender?.(event);
    if (this.eventWaiters.length > 0) {
      const resolve = this.eventWaiters.shift()!;
      resolve(event);
    } else {
      this.eventQueue.push(event);
    }
  }

  private pullEvent(): Promise<SSEEvent | null> {
    if (this.eventQueue.length > 0) {
      return Promise.resolve(this.eventQueue.shift()!);
    }
    return new Promise((resolve) => {
      this.eventWaiters.push(resolve);
    });
  }

  private signalDone(): void {
    while (this.eventWaiters.length > 0) {
      const resolve = this.eventWaiters.shift()!;
      resolve(null);
    }
  }

  private constructor(
    runner: EnhancedRunner,
    state: AgentState,
    bridge: AskHumanBridge,
    options: AgentSessionOptions
  ) {
    this.runner = runner;
    this.state = state;
    this.bridge = bridge;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.sessionId = options.sessionId ?? state.id;
    this.workspacePath = options.workspacePath ?? path.resolve(__dirname, '../workspace');
    this.agentName = options.agentName;
    this.model = options.model ?? process.env.LLM_MODEL ?? 'deepseek-chat';
  }

  /** Create a new AgentSession with EnhancedRunner */
  static async create(options: AgentSessionOptions): Promise<AgentSession> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workspacePath = options.workspacePath ?? path.resolve(__dirname, '../workspace');

    // Shared bridge — both handler and session hold a reference to the same object
    const bridge: AskHumanBridge = {
      sseSender: null,
      cockpitSender: null,
      pendingHumanInput: new Map(),
    };

    // Build LLM client from .env
    const llmClient = new LLMClient();
    llmClient.registerProvider({
      name: 'openai',
      baseUrl: process.env.LLM_BASE_URL,
      maxConcurrency: 10,
    });
    llmClient.registerApiKey({
      key: process.env.LLM_API_KEY ?? '',
      provider: 'openai',
      maxConcurrency: 5,
      models: [
        {
          modelId: options.model ?? process.env.LLM_MODEL ?? 'deepseek-chat',
          maxConcurrency: 3,
        },
      ],
    });

    // AskHuman handler: bridges colts ask_human -> SSE -> frontend via shared bridge
    const askHumanHandler: AskHumanHandlerType = async ({ questions, context }) => {
      const requestId = `human-${Date.now()}`;
      bridge.sseSender?.({
        event: 'human-input',
        data: { requestId, questions, context },
      });
      return new Promise<HumanResponse>((resolve, reject) => {
        bridge.pendingHumanInput.set(requestId, { resolve, reject });
      });
    };

    const runner = await EnhancedRunner.create({
      llmClient,
      model: options.model ?? process.env.LLM_MODEL ?? 'deepseek-chat',
      workspacePath,
      sandbox: true,
      askHumanHandler,
      thinkingEnabled: true,
      skillDirs: options.skillDirs,
      mcpConfigPaths: options.mcpConfigPaths,
      sessionBaseDir: options.sessionBaseDir,
    });

    const state = createAgentState({
      name: options.agentName,
      tools: [],
      instructions:
        options.agentInstructions ??
        `你是一个功能丰富的 AI 助手。你可以：
1. 读写工作区文件（使用 file_* 工具）
2. 搜索互联网获取信息（使用 web_search 工具）
3. 执行 shell 命令（使用 shell 工具）
4. 加载技能执行复杂任务（使用 load_skill 工具）
5. 在不确定时向用户提问（使用 ask_human 工具）
6. 管理任务清单（使用 todo_* 工具）

请用中文回答。`,
    });

    return new AgentSession(runner, state, bridge, options);
  }

  /** Get current agent state */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get conversation messages for history reconstruction.
   *
   * Returns the raw colts Message[] so the client can rebuild a
   * SessionRunState via skill-ui-state's fromHistory().
   */
  getMessages() {
    return this.state.context.messages;
  }

  /** Set cockpit event sender for SSE streaming */
  setCockpitSender(sender: ((event: SSEEvent) => void) | null): void {
    this.bridge.cockpitSender = sender;
  }

  /** User responds to AskHuman request */
  respondHumanInput(requestId: string, response: unknown): boolean {
    const pending = this.bridge.pendingHumanInput.get(requestId);
    if (!pending) return false;
    pending.resolve(response as HumanResponse);
    this.bridge.pendingHumanInput.delete(requestId);
    this.bridge.sseSender?.({
      event: 'human-input-resolved',
      data: { requestId, response },
    });
    return true;
  }

  /**
   * Stream process user message, yield SSE events.
   *
   * Uses runner.run() with event handlers attached via runner.on().
   * All colts RunnerEventMap events are mapped to hyphenated SSE events
   * and pushed to the queue — no events are dropped.
   */
  async *handleMessage(message: string): AsyncIterable<SSEEvent> {
    this.abortController = new AbortController();
    this.eventQueue = [];
    this.eventWaiters = [];

    this.bridge.sseSender = (event: SSEEvent) => this.pushEvent(event);

    this.state = addUserMessage(this.state, message);

    // Register event handlers that convert colts events to SSE events
    const handlers: Array<[string, (...args: unknown[]) => void]> = [];
    const registerHandler = (eventName: string, fn: (...args: unknown[]) => void) => {
      this.runner.on(eventName as never, fn);
      handlers.push([eventName, fn]);
    };

    // ── Streaming output ──
    registerHandler('token', (data) => {
      const d = data as { token: string };
      this.pushEvent({ event: 'token', data: { delta: d.token } });
    });
    registerHandler('thinking', (data) => {
      const d = data as { content: string };
      this.pushEvent({ event: 'thinking', data: { content: d.content } });
    });

    // ── Step lifecycle ──
    registerHandler('step:start', (data) => {
      const d = data as { step: number };
      this.pushEvent({ event: 'step-start', data: { step: d.step } });
    });
    registerHandler('step:end', (data) => {
      const d = data as { step: number; result: { tokens?: unknown; duration?: number } };
      this.pushEvent({
        event: 'step-end',
        data: { step: d.step, tokens: d.result?.tokens, duration: d.result?.duration },
      });
    });

    // ── Phase ──
    registerHandler('phase-change', (data) => {
      const d = data as { from: { type: string }; to: { type: string } };
      this.pushEvent({ event: 'phase-change', data: { from: d.from, to: d.to } });
    });

    // ── LLM ──
    registerHandler('llm:request', (data) => {
      const d = data as { messages: unknown[]; tools: string[]; skill: { current: string | null } | null };
      this.pushEvent({
        event: 'llm-request',
        data: { messages: d.messages, tools: d.tools, skill: d.skill },
      });
    });
    registerHandler('llm:response', (data) => {
      const d = data as { text: string; toolCalls: unknown; tokens?: unknown };
      this.pushEvent({
        event: 'llm-response',
        data: { text: d.text, toolCalls: d.toolCalls, tokens: d.tokens },
      });
    });

    // ── Tools ──
    registerHandler('tool:start', (data) => {
      const d = data as { action: { id: string; tool: string; arguments: unknown } };
      this.pushEvent({
        event: 'tool-start',
        data: { id: d.action.id, name: d.action.tool, args: d.action.arguments },
      });
    });
    registerHandler('tools:start', (data) => {
      const d = data as { actions: Array<{ id: string; tool: string; arguments: unknown }> };
      for (const action of d.actions) {
        this.pushEvent({
          event: 'tool-start',
          data: { id: action.id, name: action.tool, args: action.arguments },
        });
      }
    });
    registerHandler('tool:end', (data) => {
      const d = data as { result: unknown; callId?: string };
      const result = typeof d.result === 'object' ? JSON.stringify(d.result, null, 2) : String(d.result);
      this.pushEvent({ event: 'tool-end', data: { callId: d.callId, result } });
    });
    registerHandler('tools:end', (data) => {
      const d = data as { results: Record<string, unknown> };
      for (const [callId, result] of Object.entries(d.results)) {
        const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        this.pushEvent({ event: 'tool-end', data: { callId, result: resultStr } });
      }
    });

    // ── Skills ──
    registerHandler('skill:loading', (data) => {
      const d = data as { name: string };
      this.pushEvent({ event: 'skill-loading', data: { name: d.name } });
    });
    registerHandler('skill:loaded', (data) => {
      const d = data as { name: string; tokenCount: number };
      this.pushEvent({ event: 'skill-loaded', data: { name: d.name, tokenCount: d.tokenCount } });
    });
    registerHandler('skill:start', (data) => {
      const d = data as { name: string; task: string };
      this.pushEvent({ event: 'skill-start', data: { name: d.name, task: d.task } });
    });
    registerHandler('skill:end', (data) => {
      const d = data as { name: string; result: string };
      this.pushEvent({ event: 'skill-end', data: { name: d.name, result: d.result } });
    });

    // ── Sub-agent events (forwarded by delegate tool) ──
    registerHandler('subagent:start', (data) => {
      const d = data as { name: string; task: string; subtaskId?: string };
      this.pushEvent({ event: 'subagent-start', data: { name: d.name, task: d.task, subtaskId: d.subtaskId } });
    });
    registerHandler('subagent:token', (data) => {
      const d = data as { token: string; subtaskId: string; subagentName: string };
      this.pushEvent({
        event: 'subagent-token',
        data: { subtaskId: d.subtaskId, name: d.subagentName, delta: d.token },
      });
    });
    registerHandler('subagent:thinking', (data) => {
      const d = data as { content: string; subtaskId: string; subagentName: string };
      this.pushEvent({
        event: 'subagent-thinking',
        data: { subtaskId: d.subtaskId, name: d.subagentName, content: d.content },
      });
    });
    registerHandler('subagent:tool:start', (data) => {
      const d = data as { action: unknown; subtaskId: string; subagentName: string };
      this.pushEvent({
        event: 'subagent-tool-start',
        data: { subtaskId: d.subtaskId, name: d.subagentName, action: d.action },
      });
    });
    registerHandler('subagent:tool:end', (data) => {
      const d = data as { result: unknown; subtaskId: string; subagentName: string };
      this.pushEvent({
        event: 'subagent-tool-end',
        data: { subtaskId: d.subtaskId, name: d.subagentName, result: d.result },
      });
    });
    registerHandler('subagent:end', (data) => {
      const d = data as { name: string; result: unknown; subtaskId?: string };
      this.pushEvent({
        event: 'subagent-end',
        data: { name: d.name, subtaskId: d.subtaskId, result: d.result },
      });
    });

    // ── Compression ──
    registerHandler('compressing', () => {
      this.pushEvent({ event: 'compressing', data: {} });
    });
    registerHandler('compressed', (data) => {
      const d = data as { summary: string; removedCount: number };
      this.pushEvent({ event: 'compressed', data: { summary: d.summary, removedCount: d.removedCount } });
    });

    // ── Terminal ──
    registerHandler('complete', (data) => {
      const d = data as { result: Record<string, unknown> };
      const result = d.result ?? {};
      this.pushEvent({
        event: 'done',
        data: {
          type: result.type,
          answer: result.answer,
          totalSteps: result.totalSteps,
          tokens: result.tokens,
          duration: result.duration,
        },
      });
    });
    registerHandler('error', (data) => {
      const d = data as { error: { message: string } };
      this.pushEvent({ event: 'error', data: { message: d.error.message } });
    });

    // Run the agent — events flow through the handlers above
    const consumeRun = async () => {
      try {
        const { state: finalState } = await this.runner.run(this.state, {
          signal: this.abortController!.signal,
        });
        this.state = finalState;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          this.pushEvent({ event: 'done', data: { aborted: true } });
        } else {
          this.pushEvent({ event: 'error', data: { message: String(err) } });
        }
      } finally {
        // Unregister all handlers
        for (const [eventName, fn] of handlers) {
          this.runner.off(eventName as never, fn);
        }
        this.signalDone();
        this.bridge.sseSender = null;
      }
    };

    consumeRun();

    while (true) {
      const event = await this.pullEvent();
      if (event === null) break;
      yield event;
    }
  }

  /** Stop current run */
  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}

/** Write SSE event to Express Response */
export function writeSSE(res: Response, sse: SSEEvent): void {
  res.write(`event: ${sse.event}\ndata: ${JSON.stringify(sse.data)}\n\n`);
}
