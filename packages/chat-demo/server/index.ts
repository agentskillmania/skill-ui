/**
 * chat-demo server entry
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createChatRouter } from './routes/chat.js';

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

// Chat API
app.use('/api', createChatRouter());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`[chat-demo] 服务端已启动: http://localhost:${port}`);
});
