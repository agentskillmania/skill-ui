import { describe, it, expect } from 'vitest';
import { findFileNode, toggleDirExpanded, flattenTree } from '../../../src/core/resources/files.js';
import type { FileNode } from '../../../src/core/resources/files.js';

const sampleTree: FileNode[] = [
  {
    name: 'src',
    path: '/src',
    type: 'directory',
    children: [
      { name: 'index.ts', path: '/src/index.ts', type: 'file' },
      { name: 'app.ts', path: '/src/app.ts', type: 'file' },
    ],
  },
  { name: 'README.md', path: '/README.md', type: 'file' },
];

describe('findFileNode', () => {
  it('finds a file at root level', () => {
    const node = findFileNode(sampleTree, '/README.md');
    expect(node?.name).toBe('README.md');
  });
  it('finds a file nested in a directory', () => {
    const node = findFileNode(sampleTree, '/src/index.ts');
    expect(node?.name).toBe('index.ts');
  });
  it('finds a directory', () => {
    const node = findFileNode(sampleTree, '/src');
    expect(node?.type).toBe('directory');
  });
  it('returns undefined for non-existent path', () => {
    const node = findFileNode(sampleTree, '/nope');
    expect(node).toBeUndefined();
  });
});

describe('toggleDirExpanded', () => {
  it('adds path to expanded set when not present', () => {
    const result = toggleDirExpanded(new Set<string>(), '/src');
    expect(result.has('/src')).toBe(true);
  });
  it('removes path from expanded set when present', () => {
    const result = toggleDirExpanded(new Set<string>(['/src']), '/src');
    expect(result.has('/src')).toBe(false);
  });
  it('does not mutate the original set', () => {
    const expanded = new Set<string>();
    toggleDirExpanded(expanded, '/src');
    expect(expanded.size).toBe(0);
  });
});

describe('flattenTree', () => {
  it('flattens tree into file paths (files only, directories excluded)', () => {
    const paths = flattenTree(sampleTree);
    expect(paths).toContain('/src/index.ts');
    expect(paths).toContain('/src/app.ts');
    expect(paths).toContain('/README.md');
    expect(paths).not.toContain('/src');
  });
});
