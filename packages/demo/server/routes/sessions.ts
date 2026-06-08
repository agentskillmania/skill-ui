/**
 * Session CRUD API routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import type { SessionManager } from '../session-manager.js';
import type { CreateSessionRequest } from '../types.js';

/**
 * Create an Express router with session CRUD endpoints.
 *
 * @param manager - SessionManager instance handling session lifecycle
 * @returns Express Router mounted at /api/sessions
 */
export function createSessionsRouter(manager: SessionManager): Router {
  const router = Router();

  // POST / — create a new session
  router.post('/', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as CreateSessionRequest;
    const { workspacePath, agentPath } = body;

    if (!workspacePath && !agentPath) {
      res.status(400).json({ error: 'workspacePath or agentPath is required' });
      return;
    }

    try {
      const id = await manager.createSession({
        workspacePath: workspacePath ?? '.',
        agentName: 'general-agent',
        agentInstructions: 'You are a helpful AI assistant.',
      });
      const info = manager.getSessionInfo(id);
      res.status(201).json(info);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // GET / — list all sessions
  router.get('/', async (_req: Request, res: Response) => {
    const sessions = await manager.listSessions();
    res.json(sessions);
  });

  // GET /:id — get session by ID
  router.get('/:id', (req: Request, res: Response) => {
    const info = manager.getSessionInfo(req.params.id as string);
    if (!info) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(info);
  });

  // DELETE /:id — delete a session
  router.delete('/:id', async (req: Request, res: Response) => {
    await manager.deleteSession(req.params.id as string);
    res.json({ ok: true });
  });

  return router;
}
