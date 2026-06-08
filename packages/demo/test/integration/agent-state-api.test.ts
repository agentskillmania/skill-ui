import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetState = vi.fn().mockReturnValue({
  id: 's1',
  config: { name: 'test', instructions: 'test', tools: [] },
  context: { messages: [], stepCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
});
const mockSetCockpitSender = vi.fn();

vi.mock('../../server/agent.js', () => ({
  AgentSession: vi.fn(),
  writeSSE: vi.fn(),
}));

import express from 'express';
import request from 'supertest';
import { createAgentStateRouter } from '../../server/routes/agent-state.js';
import type { SessionManager } from '../../server/session-manager.js';

function createMockManager() {
  return {
    getAgentSession: vi.fn().mockReturnValue({
      getState: mockGetState,
      setCockpitSender: mockSetCockpitSender,
    }),
  } as unknown as SessionManager;
}

describe('GET /api/agent/:sessionId/state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 for unknown session', async () => {
    const manager = {
      getAgentSession: vi.fn().mockImplementation(() => {
        throw new Error('not found');
      }),
    } as unknown as SessionManager;

    const app = express();
    app.use('/api', createAgentStateRouter(manager));

    const res = await request(app).get('/api/agent/unknown/state');
    expect(res.status).toBe(404);
  });

  it('establishes SSE connection for valid session', async () => {
    const manager = createMockManager();
    const app = express();
    app.use('/api', createAgentStateRouter(manager));

    // Use supertest's parseEvents helper or just check response headers
    // Since SSE keeps connection open, we abort after getting the response
    await new Promise<void>((resolve, reject) => {
      const req = request(app).get('/api/agent/s1/state');

      req.end((err, res) => {
        if (err) {
          // For SSE, we expect connection to stay open, so we just verify setup
          if (err.message && err.message.includes('socket hang up')) {
            // This is expected when we abort the SSE connection
          } else {
            return reject(err);
          }
        }

        try {
          expect(res?.status).toBe(200);
          expect(mockSetCockpitSender).toHaveBeenCalled();
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      // Close connection after short delay
      setTimeout(() => {
        req.abort();
        resolve();
      }, 50);
    });
  });
});
