/**
 * Chat API routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { AgentSession, writeSSE } from '../agent.js';

/** Command list */
const COMMANDS = [
  {
    id: 'time',
    label: '当前时间',
    command: '现在几点了？',
    group: '工具',
    description: '获取当前时间',
  },
  {
    id: 'calc',
    label: '计算器',
    command: '帮我计算 ',
    group: '工具',
    description: '计算数学表达式',
  },
  {
    id: 'search',
    label: '搜索',
    command: '帮我搜索 ',
    group: '工具',
    description: '直接搜索互联网信息',
  },
  {
    id: 'ai-news',
    label: 'AI 新闻',
    command: '帮我整理一下最近的 AI 行业动态',
    group: '技能',
    description: '加载 AI 新闻技能，多角度搜索并整合结果',
  },
  {
    id: 'think',
    label: '深度思考',
    command: '请仔细思考后回答：',
    group: '对话',
    description: '触发深度思考模式',
  },
  {
    id: 'ask',
    label: '向我提问',
    command: '请先向我提问，了解清楚后再回答：',
    group: '交互',
    description: '让 AI 向你提问以了解需求',
  },
  {
    id: 'error',
    label: '测试错误',
    command: '请调用 failing_tool 工具测试一下错误处理',
    group: '测试',
    description: '模拟工具调用错误',
  },
];

export function createChatRouter(): Router {
  const router = Router();

  // Singleton session (for demo)
  let session: AgentSession | null = null;

  // POST /api/chat — SSE streaming chat
  router.post('/chat', async (req: Request, res: Response) => {
    const { message } = req.body as { message?: string };

    if (!message?.trim()) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    // Initialize or reuse session
    if (!session) {
      session = new AgentSession();
    }

    // Set SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const sse of session.handleMessage(message)) {
        writeSSE(res, sse);
      }
    } catch {
      writeSSE(res, { event: 'error', data: { message: 'Internal server error' } });
    }

    res.end();
  });

  // POST /api/chat/stop — stop current generation
  router.post('/chat/stop', (_req: Request, res: Response) => {
    session?.stop();
    res.json({ ok: true });
  });

  // POST /api/chat/reset — reset session
  router.post('/chat/reset', (_req: Request, res: Response) => {
    session = new AgentSession();
    res.json({ ok: true });
  });

  // POST /api/chat/respond — user responds to AskHuman request
  router.post('/chat/respond', (req: Request, res: Response) => {
    const { requestId, response } = req.body as { requestId?: string; response?: unknown };

    if (!requestId) {
      res.status(400).json({ error: 'requestId is required' });
      return;
    }

    if (!session) {
      res.status(400).json({ error: 'No active session' });
      return;
    }

    const found = session.respondHumanInput(requestId, response);
    if (!found) {
      res.status(404).json({ error: 'Request not found or already answered' });
      return;
    }

    res.json({ ok: true });
  });

  // GET /api/chat/commands — get command list
  router.get('/chat/commands', (_req: Request, res: Response) => {
    res.json(COMMANDS);
  });

  return router;
}
