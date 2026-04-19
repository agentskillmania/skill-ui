/**
 * chat-demo 服务端入口
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createChatRouter } from './routes/chat.js';

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

// 聊天 API
app.use('/api', createChatRouter());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`[chat-demo] 服务端已启动: http://localhost:${port}`);
});
