/**
 * Agent state SSE — streams cockpit events for a session
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { writeSSE } from '../agent.js';
import type { SessionManager } from '../session-manager.js';

export function createAgentStateRouter(manager: SessionManager): Router {
  const router = Router();

  /** GET /api/agent/:sessionId/state — SSE stream for cockpit events */
  router.get('/agent/:sessionId/state', (req: Request, res: Response) => {
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    let session;
    try {
      session = manager.getAgentSession(sessionId);
    } catch {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send initial state snapshot (from real AgentState, not hardcoded zeros)
    const state = session.getState();
    const tokens = state.context.totalTokens;
    writeSSE(res, {
      event: 'agent-state',
      data: {
        agentName: state.config.name,
        model: session.model,
        status: 'idle' as const,
        tokensIn: tokens?.input ?? 0,
        tokensOut: tokens?.output ?? 0,
        tokensTotal: (tokens?.input ?? 0) + (tokens?.output ?? 0),
        contextLimit: 200000,
        messageCount: state.context.messages.length,
        stepCount: state.context.stepCount,
        skills: [],
        tools: [],
        estimatedContextSize: state.context.estimatedContextSize ?? 0,
        compressionHistory: [],
      },
    });

    // Forward cockpit events to SSE
    const sender = (event: { event: string; data: unknown }) => {
      writeSSE(res, event);
    };

    session.setCockpitSender(sender);

    req.on('close', () => {
      session.setCockpitSender(null);
    });
  });

  return router;
}
