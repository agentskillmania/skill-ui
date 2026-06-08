import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { createFilesRouter } from '../../server/routes/files.js';

describe('Files API', () => {
  let app: express.Express;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chat-demo-test-'));
    await fs.writeFile(path.join(tmpDir, 'test.txt'), 'hello world');
    await fs.mkdir(path.join(tmpDir, 'subdir'));
    await fs.writeFile(path.join(tmpDir, 'subdir', 'nested.ts'), 'const x = 1;');

    app = express();
    app.use(express.json());
    app.use('/api/files', createFilesRouter(tmpDir));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  describe('GET /api/files/tree', () => {
    it('returns directory tree with children', async () => {
      const res = await request(app).get('/api/files/tree');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('path');
      expect(res.body).toHaveProperty('children');
      expect(res.body.isDirectory).toBe(true);
    });

    it('excludes hidden files and node_modules', async () => {
      await fs.writeFile(path.join(tmpDir, '.hidden'), 'secret');
      await fs.mkdir(path.join(tmpDir, 'node_modules'));

      const res = await request(app).get('/api/files/tree');
      expect(res.status).toBe(200);
      const names = (res.body.children as Array<{ name: string }>).map((c) => c.name);
      expect(names).not.toContain('.hidden');
      expect(names).not.toContain('node_modules');
    });
  });

  describe('GET /api/files/content', () => {
    it('returns file content', async () => {
      const res = await request(app).get('/api/files/content?path=test.txt');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content', 'hello world');
    });

    it('returns nested file content', async () => {
      const res = await request(app).get('/api/files/content?path=subdir/nested.ts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content', 'const x = 1;');
    });

    it('returns 400 when path is missing', async () => {
      const res = await request(app).get('/api/files/content');
      expect(res.status).toBe(400);
    });

    it('returns 404 for missing file', async () => {
      const res = await request(app).get('/api/files/content?path=nonexistent.txt');
      expect(res.status).toBe(404);
    });

    it('rejects path traversal', async () => {
      const res = await request(app).get('/api/files/content?path=../../../etc/passwd');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /api/files/content', () => {
    it('saves file content', async () => {
      const res = await request(app)
        .put('/api/files/content')
        .send({ path: 'test.txt', content: 'updated' });
      expect(res.status).toBe(200);

      const content = await fs.readFile(path.join(tmpDir, 'test.txt'), 'utf-8');
      expect(content).toBe('updated');
    });

    it('returns 400 when path is missing', async () => {
      const res = await request(app).put('/api/files/content').send({ content: 'test' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when content is missing', async () => {
      const res = await request(app).put('/api/files/content').send({ path: 'test.txt' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/files', () => {
    it('creates a new file', async () => {
      const res = await request(app)
        .post('/api/files')
        .send({ path: 'new-file.ts', content: 'export const x = 1;' });
      expect(res.status).toBe(201);

      const content = await fs.readFile(path.join(tmpDir, 'new-file.ts'), 'utf-8');
      expect(content).toBe('export const x = 1;');
    });

    it('creates parent directories automatically', async () => {
      const res = await request(app)
        .post('/api/files')
        .send({ path: 'deep/nested/dir/file.ts', content: '{}' });
      expect(res.status).toBe(201);

      const content = await fs.readFile(path.join(tmpDir, 'deep/nested/dir/file.ts'), 'utf-8');
      expect(content).toBe('{}');
    });

    it('returns 400 when path is missing', async () => {
      const res = await request(app).post('/api/files').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/files', () => {
    it('deletes a file', async () => {
      const res = await request(app).delete('/api/files').send({ path: 'test.txt' });
      expect(res.status).toBe(200);

      await expect(fs.access(path.join(tmpDir, 'test.txt'))).rejects.toThrow();
    });

    it('returns 404 for missing file', async () => {
      const res = await request(app).delete('/api/files').send({ path: 'nonexistent.txt' });
      expect(res.status).toBe(404);
    });

    it('returns 400 when path is missing', async () => {
      const res = await request(app).delete('/api/files').send({});
      expect(res.status).toBe(400);
    });
  });
});
