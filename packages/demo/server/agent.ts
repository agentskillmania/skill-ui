/**
 * wrangler agent session management
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { LLMClient } from '@agentskillmania/llm-client';
import { EnhancedRunner } from '@agentskillmania/wrangler';
import { createAgentState, addUserMessage } from '@agentskillmania/colts';
import type {
  AgentState,
  RunStreamEvent,
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
 * Single agent session backed by wrangler EnhancedRunner
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

  /** Resume session with existing state (e.g. from persistence) */
  resumeWithState(state: AgentState): void {
    this.state = state;
  }

  /** Get current agent state */
  getState(): AgentState {
    return this.state;
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

  /** Stream process user message, yield SSE events */
  async *handleMessage(message: string): AsyncIterable<SSEEvent> {
    this.abortController = new AbortController();
    this.eventQueue = [];
    this.eventWaiters = [];

    this.bridge.sseSender = (event: SSEEvent) => this.pushEvent(event);

    this.state = addUserMessage(this.state, message);

    const consumeStream = async () => {
      try {
        const stream = this.runner.runStream(this.state, {
          signal: this.abortController!.signal,
        });

        while (true) {
          const { done, value } = await stream[Symbol.asyncIterator]().next();
          if (done) {
            if (value?.state) {
              this.state = value.state;
            }
            break;
          }

          const mapped = this.mapEvent(value as RunStreamEvent);
          if (mapped) {
            const events = Array.isArray(mapped) ? mapped : [mapped];
            for (const sse of events) {
              this.pushEvent(sse);
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          this.pushEvent({ event: 'done', data: { aborted: true } });
        } else {
          this.pushEvent({ event: 'error', data: { message: String(err) } });
        }
      } finally {
        this.signalDone();
        this.bridge.sseSender = null;
      }
    };

    consumeStream();

    while (true) {
      const event = await this.pullEvent();
      if (event === null) break;
      yield event;
    }
  }

  /** Stop current stream */
  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /** Map colts RunStreamEvent to SSE events */
  private mapEvent(event: RunStreamEvent): SSEEvent | SSEEvent[] | null {
    switch (event.type) {
      case 'token':
        return { event: 'token', data: { delta: event.token } };

      case 'thinking':
        return { event: 'thinking', data: { content: event.content } };

      case 'tool:start':
        return {
          event: 'tool-start',
          data: {
            id: event.action.id,
            name: event.action.tool,
            args: event.action.arguments,
          },
        };

      case 'tools:start':
        return event.actions.map((action) => ({
          event: 'tool-start' as const,
          data: {
            id: action.id,
            name: action.tool,
            args: action.arguments,
          },
        }));

      case 'tool:end':
        return {
          event: 'tool-end',
          data: {
            callId: event.callId,
            result:
              typeof event.result === 'object'
                ? JSON.stringify(event.result, null, 2)
                : String(event.result),
          },
        };

      case 'tools:end':
        return Object.entries(event.results).map(([callId, result]) => ({
          event: 'tool-end' as const,
          data: {
            callId,
            result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
          },
        }));

      case 'skill:loading':
        return {
          event: 'skill-loading',
          data: { name: event.name },
        };

      case 'skill:loaded':
        return {
          event: 'skill-loaded',
          data: { name: event.name, tokenCount: event.tokenCount },
        };

      case 'skill:start':
        return {
          event: 'skill-start',
          data: { name: event.name, task: event.task },
        };

      case 'skill:end':
        return {
          event: 'skill-end',
          data: { name: event.name, result: event.result },
        };

      case 'complete':
        return { event: 'done', data: {} };

      case 'error':
        return { event: 'error', data: { message: event.error.message } };

      default:
        return null;
    }
  }
}

/** Write SSE event to Express Response */
export function writeSSE(res: Response, sse: SSEEvent): void {
  res.write(`event: ${sse.event}\ndata: ${JSON.stringify(sse.data)}\n\n`);
}
