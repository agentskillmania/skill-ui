/**
 * File CRUD API — workspace file operations
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

/**
 * Create an Express router for workspace file CRUD operations.
 *
 * @param workspaceRoot - Path to the workspace root (relative or absolute)
 * @returns Express Router mounted at /api/files
 */
export function createFilesRouter(workspaceRoot: string): Router {
  const router = Router();

  // Normalize to absolute once — workspaceRoot may be relative ("./workspace")
  const absoluteRoot = path.resolve(workspaceRoot);

  /** Resolve and validate a path is within workspace */
  function resolvePath(relativePath: string): string {
    const resolved = path.resolve(absoluteRoot, relativePath);
    if (!resolved.startsWith(absoluteRoot)) {
      throw new Error('Path outside workspace');
    }
    return resolved;
  }

  /** GET /tree — return directory tree */
  router.get('/tree', async (_req: Request, res: Response) => {
    try {
      const tree = await buildFileTree(absoluteRoot, absoluteRoot);
      res.json(tree);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  /** GET /content?path= — return file content */
  router.get('/content', async (req: Request, res: Response) => {
    const relativePath = req.query.path as string;
    if (!relativePath) {
      res.status(400).json({ error: 'path is required' });
      return;
    }

    try {
      const fullPath = resolvePath(relativePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({ content, path: relativePath });
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  });

  /** PUT /content — save file content */
  router.put('/content', async (req: Request, res: Response) => {
    const { path: relativePath, content } = req.body as { path?: string; content?: string };
    if (!relativePath || content === undefined) {
      res.status(400).json({ error: 'path and content are required' });
      return;
    }

    try {
      const fullPath = resolvePath(relativePath);
      await fs.writeFile(fullPath, content, 'utf-8');
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  /** POST / — create new file */
  router.post('/', async (req: Request, res: Response) => {
    const { path: relativePath, content } = req.body as { path?: string; content?: string };
    if (!relativePath) {
      res.status(400).json({ error: 'path is required' });
      return;
    }

    try {
      const fullPath = resolvePath(relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content ?? '', 'utf-8');
      res.status(201).json({ ok: true, path: relativePath });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  /** DELETE / — delete file */
  router.delete('/', async (req: Request, res: Response) => {
    const { path: relativePath } = req.body as { path?: string };
    if (!relativePath) {
      res.status(400).json({ error: 'path is required' });
      return;
    }

    try {
      const fullPath = resolvePath(relativePath);
      await fs.unlink(fullPath);
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  });

  return router;
}

/** Build recursive file tree structure */
async function buildFileTree(
  dirPath: string,
  rootPath: string
): Promise<{
  path: string;
  name: string;
  isDirectory: boolean;
  children?: Array<{
    path: string;
    name: string;
    isDirectory: boolean;
    children?: unknown[];
  }>;
}> {
  const name = path.basename(dirPath);
  const relativePath = path.relative(rootPath, dirPath) || '.';

  const stat = await fs.stat(dirPath);
  if (!stat.isDirectory()) {
    return { path: relativePath, name, isDirectory: false };
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const filtered = entries.filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules');

  const children = await Promise.all(
    filtered.map((entry) => buildFileTree(path.join(dirPath, entry.name), rootPath))
  );

  return {
    path: relativePath,
    name,
    isDirectory: true,
    children: children.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
  };
}
