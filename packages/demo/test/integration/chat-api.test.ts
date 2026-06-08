import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AgentSession
const mockHandleMessage = vi.fn();
const mockStop = vi.fn();
const mockRespondHumanInput = vi.fn().mockReturnValue(true);

vi.mock('../../server/agent.js', () => ({
  AgentSession: vi.fn(),
  writeSSE: vi.fn((res, sse) => {
    res.write(`event: ${sse.event}\ndata: ${JSON.stringify(sse.data)}\n\n`);
  }),
}));

import express from 'express';
import request from 'supertest';
import { createChatRouter } from '../../server/routes/chat.js';
import type { SessionManager } from '../../server/session-manager.js';

// Create a mock SessionManager
function createMockManager(sessionId: string) {
  return {
    getAgentSession: vi.fn().mockReturnValue({
      handleMessage: mockHandleMessage,
      stop: mockStop,
      respondHumanInput: mockRespondHumanInput,
    }),
    getSessionInfo: vi.fn().mockReturnValue({
      id: sessionId,
      workspacePath: '/tmp/ws',
      agentName: 'test',
      model: 'test',
      status: 'idle',
    }),
    updateSessionInfo: vi.fn(),
  } as unknown as SessionManager;
}

describe('Chat API', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
  });

  describe('POST /api/chat/:sessionId', () => {
    it('returns 400 when message is empty', async () => {
      const manager = createMockManager('s1');
      app.use('/api', createChatRouter(manager));

      const res = await request(app).post('/api/chat/s1').send({ message: '' });

      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown session', async () => {
      const manager = {
        getAgentSession: vi.fn().mockImplementation(() => {
          throw new Error('Session not found');
        }),
      } as unknown as SessionManager;

      app.use('/api', createChatRouter(manager));

      const res = await request(app).post('/api/chat/unknown').send({ message: 'hello' });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/chat/:sessionId/stop', () => {
    it('stops the session', async () => {
      const manager = createMockManager('s1');
      app.use('/api', createChatRouter(manager));

      const res = await request(app).post('/api/chat/s1/stop');
      expect(res.status).toBe(200);
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('POST /api/chat/:sessionId/respond', () => {
    it('responds to human input', async () => {
      const manager = createMockManager('s1');
      app.use('/api', createChatRouter(manager));

      const res = await request(app)
        .post('/api/chat/s1/respond')
        .send({ requestId: 'req-1', response: { answer: 'yes' } });

      expect(res.status).toBe(200);
      expect(mockRespondHumanInput).toHaveBeenCalledWith('req-1', { answer: 'yes' });
    });
  });
});
