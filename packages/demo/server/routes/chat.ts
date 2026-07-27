/**
 * Chat API routes — session-scoped via SessionManager
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { writeSSE } from '../agent.js';
import type { SessionManager } from '../session-manager.js';

const COMMANDS = [
  {
    id: 'search',
    label: '搜索',
    command: '帮我搜索 ',
    group: '工具',
    description: '搜索互联网信息',
  },
  {
    id: 'file',
    label: '文件操作',
    command: '帮我查看工作区里有哪些文件',
    group: '工具',
    description: '读写工作区文件',
  },
  {
    id: 'shell',
    label: '执行命令',
    command: '帮我执行命令：',
    group: '工具',
    description: '执行 shell 命令',
  },
  {
    id: 'todo',
    label: '任务管理',
    command: '帮我创建一个任务清单：',
    group: '工具',
    description: '管理任务清单',
  },
  {
    id: 'ask',
    label: '向我提问',
    command: '请先向我提问，了解清楚后再回答：',
    group: '交互',
    description: '让 AI 向你提问以了解需求',
  },
  {
    id: 'think',
    label: '深度思考',
    command: '请仔细思考后回答：',
    group: '对话',
    description: '触发深度思考模式',
  },
];

export function createChatRouter(manager: SessionManager): Router {
  const router = Router();

  /** POST /api/chat/:sessionId — SSE streaming chat */
  router.post('/chat/:sessionId', async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const { message } = req.body as { message?: string };

    if (!message?.trim()) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    let session;
    try {
      session = manager.getAgentSession(sessionId);
    } catch {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    manager.updateSessionInfo(sessionId, { status: 'running' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const sse of session.handleMessage(message)) {
        writeSSE(res, sse);
      }
      manager.updateSessionInfo(sessionId, { status: 'idle' });
    } catch {
      writeSSE(res, { event: 'error', data: { message: 'Internal server error' } });
      manager.updateSessionInfo(sessionId, { status: 'error' });
    }

    res.end();
  });

  /** POST /api/chat/:sessionId/stop */
  router.post('/chat/:sessionId/stop', (req: Request, res: Response) => {
    try {
      manager.getAgentSession(req.params.sessionId as string).stop();
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  /** POST /api/chat/:sessionId/respond */
  router.post('/chat/:sessionId/respond', (req: Request, res: Response) => {
    const { requestId, response } = req.body as { requestId?: string; response?: unknown };

    if (!requestId) {
      res.status(400).json({ error: 'requestId is required' });
      return;
    }

    try {
      const found = manager
        .getAgentSession(req.params.sessionId as string)
        .respondHumanInput(requestId, response);
      if (!found) {
        res.status(404).json({ error: 'Request not found or already answered' });
        return;
      }
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  /**
   * GET /api/chat/:sessionId/messages
   *
   * Returns conversation history as raw colts Message[]. Used by the client
   * to rebuild SessionRunState via skill-ui-state's fromHistory() when a
   * session is resumed.
   */
  router.get('/chat/:sessionId/messages', (req: Request, res: Response) => {
    try {
      const messages = manager.getAgentSession(req.params.sessionId as string).getMessages();
      res.json({ messages });
    } catch {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  /** GET /api/chat/commands */
  router.get('/chat/commands', (_req: Request, res: Response) => {
    res.json(COMMANDS);
  });

  return router;
}
