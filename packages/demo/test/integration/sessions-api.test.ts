/**
 * Integration tests for sessions CRUD API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { SessionInfo } from '../../server/types.js';
import { createSessionsRouter } from '../../server/routes/sessions.js';

// ---------------------------------------------------------------------------
// Mock SessionManager — provides all methods used by the sessions router
// ---------------------------------------------------------------------------

function createMockManager() {
  const sessions = new Map<string, SessionInfo>();

  return {
    createSession: vi.fn(async (_opts: unknown): Promise<string> => {
      const id = `session-${Date.now()}`;
      sessions.set(id, {
        id,
        workspacePath: '.',
        agentName: 'general-agent',
        model: 'deepseek-chat',
        status: 'idle',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      });
      return id;
    }),

    listSessions: vi.fn(async (): Promise<SessionInfo[]> => {
      return Array.from(sessions.values());
    }),

    getSessionInfo: vi.fn((id: string): SessionInfo | undefined => {
      return sessions.get(id);
    }),

    deleteSession: vi.fn(async (id: string): Promise<void> => {
      sessions.delete(id);
    }),

    // Test helper — inject a session directly
    _inject(id: string, info: SessionInfo) {
      sessions.set(id, info);
    },
  };
}

type MockManager = ReturnType<typeof createMockManager>;

// ---------------------------------------------------------------------------
// Helper to build an Express app with the sessions router mounted
// ---------------------------------------------------------------------------

function buildApp(manager: MockManager) {
  const app = express();
  app.use(express.json());
  app.use(
    '/api/sessions',
    createSessionsRouter(manager as unknown as Parameters<typeof createSessionsRouter>[0])
  );
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Sessions CRUD API', () => {
  let manager: MockManager;
  let app: express.Express;

  beforeEach(() => {
    manager = createMockManager();
    app = buildApp(manager);
  });

  // -----------------------------------------------------------------------
  // POST /api/sessions — create session
  // -----------------------------------------------------------------------

  describe('POST /api/sessions', () => {
    it('should return 201 with session info when workspacePath is provided', async () => {
      const res = await request(app).post('/api/sessions').send({ workspacePath: '/tmp/test' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('workspacePath');
      expect(res.body).toHaveProperty('agentName');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(manager.createSession).toHaveBeenCalledOnce();
    });

    it('should return 201 when only agentPath is provided', async () => {
      const res = await request(app).post('/api/sessions').send({ agentPath: '/agents/foo' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should return 400 when neither workspacePath nor agentPath is provided', async () => {
      const res = await request(app).post('/api/sessions').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/workspacePath or agentPath is required/);
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app).post('/api/sessions').send();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 500 when manager.createSession throws', async () => {
      manager.createSession.mockRejectedValueOnce(new Error('DB down'));

      const res = await request(app).post('/api/sessions').send({ workspacePath: '/tmp/test' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/sessions — list sessions
  // -----------------------------------------------------------------------

  describe('GET /api/sessions', () => {
    it('should return an empty array when no sessions exist', async () => {
      const res = await request(app).get('/api/sessions');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all sessions', async () => {
      const now = new Date().toISOString();
      manager._inject('s1', {
        id: 's1',
        workspacePath: '/tmp/a',
        agentName: 'agent-a',
        model: 'deepseek-chat',
        status: 'idle',
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
      });
      manager._inject('s2', {
        id: 's2',
        workspacePath: '/tmp/b',
        agentName: 'agent-b',
        model: 'deepseek-chat',
        status: 'running',
        createdAt: now,
        updatedAt: now,
        messageCount: 3,
      });

      const res = await request(app).get('/api/sessions');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(manager.listSessions).toHaveBeenCalledOnce();
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/sessions/:id — get session info
  // -----------------------------------------------------------------------

  describe('GET /api/sessions/:id', () => {
    it('should return session info for a valid id', async () => {
      const now = new Date().toISOString();
      manager._inject('s1', {
        id: 's1',
        workspacePath: '/tmp/a',
        agentName: 'agent-a',
        model: 'deepseek-chat',
        status: 'idle',
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
      });

      const res = await request(app).get('/api/sessions/s1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('s1');
      expect(res.body.workspacePath).toBe('/tmp/a');
    });

    it('should return 404 for an unknown session id', async () => {
      const res = await request(app).get('/api/sessions/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/Session not found/);
    });
  });

  // -----------------------------------------------------------------------
  // DELETE /api/sessions/:id — delete session
  // -----------------------------------------------------------------------

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session and return ok', async () => {
      const now = new Date().toISOString();
      manager._inject('s1', {
        id: 's1',
        workspacePath: '/tmp/a',
        agentName: 'agent-a',
        model: 'deepseek-chat',
        status: 'idle',
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
      });

      const res = await request(app).delete('/api/sessions/s1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(manager.deleteSession).toHaveBeenCalledWith('s1');
    });

    it('should succeed even when deleting a non-existent session', async () => {
      const res = await request(app).delete('/api/sessions/nonexistent');

      // The router delegates to manager.deleteSession which is a no-op for
      // missing IDs in the mock, so it still returns ok.
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(manager.deleteSession).toHaveBeenCalledWith('nonexistent');
    });
  });
});
