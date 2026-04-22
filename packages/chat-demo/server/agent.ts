/**
 * colts agent session management
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AgentRunner,
  createAgentState,
  addUserMessage,
  createAskHumanTool,
} from '@agentskillmania/colts';
import type { AgentState, RunStreamEvent, AskHumanHandler } from '@agentskillmania/colts';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import type { Response } from 'express';

/** SSE event payload */
export interface SSEEvent {
  event: string;
  data: unknown;
}

/**
 * Single agent session (in-memory)
 */
export class AgentSession {
  private runner: AgentRunner;
  private state: AgentState;
  private abortController: AbortController | null = null;

  /** AskHuman pending wait queue: requestId → { resolve, reject } */
  private pendingHumanInput = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >();

  /** SSE event sender callback (set during handleMessage) */
  private sseSender: ((event: SSEEvent) => void) | null = null;

  constructor() {
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY ?? '' });

    // AskHuman handler: sends SSE human-input event, then suspends waiting for user response
    const askHumanHandler: AskHumanHandler = async ({ questions, context }) => {
      const requestId = `human-${Date.now()}`;

      // Send human-input SSE event
      this.sseSender?.({
        event: 'human-input',
        data: {
          requestId,
          questions,
          context,
        },
      });

      // Suspend waiting for user response
      return new Promise((resolve, reject) => {
        this.pendingHumanInput.set(requestId, { resolve, reject });
      });
    };

    // Skill directory
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const skillDir = path.resolve(__dirname, 'skills');

    this.runner = new AgentRunner({
      model: process.env.LLM_MODEL ?? 'deepseek-chat',
      llm: {
        apiKey: process.env.LLM_API_KEY ?? '',
        provider: 'openai',
        baseUrl: process.env.LLM_BASE_URL,
      },
      tools: [
        currentTimeTool,
        calculateTool,
        webSearchTool(tavilyClient),
        failingTool,
        createAskHumanTool(askHumanHandler),
      ],
      skillDirectories: [skillDir],
      maxSteps: 20,
      thinkingEnabled: true,
    });

    this.state = createAgentState({
      name: 'demo-agent',
      instructions: `你是一个功能丰富的 AI 助手 demo。你可以：
1. 获取当前时间
2. 计算数学表达式
3. 搜索互联网获取信息（使用 web_search 工具）
4. 加载技能执行复杂任务（使用 load_skill 工具，如 "ai-news" 技能）
5. 在不确定时向用户提问（使用 ask_human 工具）

当用户想了解 AI 领域的最新动态时，请使用 load_skill 加载 "ai-news" 技能，按照技能指导完成搜索和整理。普通搜索可直接使用 web_search。

请用中文回答。`,
      tools: [
        { name: 'get_current_time', description: '获取当前时间' },
        { name: 'calculate', description: '计算数学表达式' },
        { name: 'web_search', description: '搜索互联网获取信息' },
        { name: 'load_skill', description: '加载一个技能（如 ai-news）' },
        { name: 'return_skill', description: '完成技能执行并返回结果' },
        { name: 'failing_tool', description: '模拟错误（测试用）' },
        { name: 'ask_human', description: '向用户提问以获取信息或确认' },
      ],
    });
  }

  /** User responds to AskHuman request */
  respondHumanInput(requestId: string, response: unknown): boolean {
    const pending = this.pendingHumanInput.get(requestId);
    if (!pending) return false;
    pending.resolve(response);
    this.pendingHumanInput.delete(requestId);
    return true;
  }

  /** Stream process user message, yield SSE events */
  async *handleMessage(message: string): AsyncIterable<SSEEvent> {
    this.abortController = new AbortController();

    // Set SSE sender so ask_human handler can send events
    const eventQueue: SSEEvent[] = [];
    this.sseSender = (event: SSEEvent) => eventQueue.push(event);

    // Add user message to state
    this.state = addUserMessage(this.state, message);

    try {
      const stream = this.runner.runStream(this.state, {
        signal: this.abortController.signal,
      });

      // Use while loop instead of for-await to capture generator's return value (final state)
      while (true) {
        const { done, value } = await stream.next();
        if (done) {
          // runStream return value: { state, result }
          if (value?.state) {
            this.state = value.state;
          }
          break;
        }

        const event = value as RunStreamEvent;
        const sse = this.mapEvent(event);
        if (sse) yield sse;

        // Send events produced by ask_human handler
        while (eventQueue.length > 0) {
          yield eventQueue.shift()!;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        yield { event: 'done', data: { aborted: true } };
      } else {
        yield { event: 'error', data: { message: String(err) } };
      }
    } finally {
      this.sseSender = null;
    }
  }

  /** Stop current stream */
  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /** Map colts RunStreamEvent to SSE events */
  private mapEvent(event: RunStreamEvent): SSEEvent | null {
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

      case 'complete': {
        return { event: 'done', data: {} };
      }

      case 'error':
        return { event: 'error', data: { message: event.error.message } };

      // Ignore unnecessary events
      case 'phase-change':
      case 'tools:start':
      case 'tools:end':
      case 'step:start':
      case 'step:end':
      case 'compressing':
      case 'compressed':
      case 'llm:request':
      case 'llm:response':
      case 'subagent:start':
      case 'subagent:end':
        return null;

      default:
        return null;
    }
  }
}

/** Get current time tool */
const currentTimeTool = {
  name: 'get_current_time',
  description: '获取当前日期和时间',
  parameters: z.object({}),
  execute: async () => {
    return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  },
};

/** Calculate tool */
const calculateTool = {
  name: 'calculate',
  description: '计算数学表达式并返回结果。支持基本四则运算、幂运算和常用数学函数。',
  parameters: z.object({
    expression: z.string().describe('数学表达式，如 "2 + 3 * 4" 或 "Math.sqrt(16)"'),
  }),
  execute: async ({ expression }: { expression: string }) => {
    const sanitized = expression.replace(
      /[^0-9+\-*/().%\sMathsqrt,pow,abs,ceil,floor,round,PI,E,min,max]/g,
      ''
    );
    try {
      const result = new Function(`"use strict"; return (${sanitized})`)();
      return { expression, result: Number(result) };
    } catch {
      return { expression, error: '无法计算该表达式' };
    }
  },
};

/** Create Tavily search tool */
function webSearchTool(client: ReturnType<typeof tavily>) {
  return {
    name: 'web_search',
    description: '搜索互联网获取最新信息。返回搜索结果的标题、链接和摘要。',
    parameters: z.object({
      query: z.string().describe('搜索关键词'),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const result = await client.search(query, {
          searchDepth: 'basic',
          maxResults: 5,
          includeAnswer: true,
        });
        return {
          answer: result.answer,
          results: result.results.map((r) => ({
            title: r.title,
            url: r.url,
            content: r.content,
          })),
        };
      } catch (err) {
        return { error: `搜索失败: ${String(err)}` };
      }
    },
  };
}

/** Simulate error tool */
const failingTool = {
  name: 'failing_tool',
  description: '总是返回错误的工具（用于测试错误处理）',
  parameters: z.object({
    reason: z.string().optional().describe('失败原因'),
  }),
  execute: async ({ reason }: { reason?: string }) => {
    throw new Error(reason ?? '这是一个模拟的错误');
  },
};

/** Write SSE event to Express Response */
export function writeSSE(res: Response, sse: SSEEvent): void {
  res.write(`event: ${sse.event}\ndata: ${JSON.stringify(sse.data)}\n\n`);
}
