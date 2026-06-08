/**
 * chat-demo server entry
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { SessionManager } from './session-manager.js';
import { createChatRouter } from './routes/chat.js';
import { createLauncherRouter } from './routes/launcher.js';
import { createSessionsRouter } from './routes/sessions.js';
import { createAgentStateRouter } from './routes/agent-state.js';
import { createFilesRouter } from './routes/files.js';

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

const manager = new SessionManager();

// API routes — all receive SessionManager
app.use('/api', createLauncherRouter(manager));
app.use('/api', createSessionsRouter(manager));
app.use('/api', createChatRouter(manager));
app.use('/api', createAgentStateRouter(manager));

// Files API — session-aware, resolves workspace path from session info
app.use('/api/files/:sessionId', (req, res, next) => {
  const info = manager.getSessionInfo(req.params.sessionId as string);
  if (!info) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  createFilesRouter(info.workspacePath)(req, res, next);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`[chat-demo] server started: http://localhost:${port}`);
});
