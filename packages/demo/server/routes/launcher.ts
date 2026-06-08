/**
 * Launcher data API — agents, skills, sessions
 */
import { Router } from 'express';
import type { SessionManager } from '../session-manager.js';

/**
 * Create the launcher router for discovering available agents, skills,
 * and active sessions.
 *
 * @param manager - SessionManager instance for data access
 * @returns Express Router mounted at /launcher
 */
export function createLauncherRouter(manager: SessionManager): Router {
  const router = Router();

  router.get('/launcher', async (_req, res) => {
    try {
      await manager.ensureDirectories();
      const [agents, skills, sessions] = await Promise.all([
        manager.listAgents(),
        manager.listSkills(),
        manager.listSessions(),
      ]);
      res.json({ agents, skills, sessions });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}
