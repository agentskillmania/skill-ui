import { describe, it, expect } from 'vitest';
import { daemonTreeToProjectFiles } from '../../src/utils/daemon-files.js';
import type { DaemonTreeNode } from '../../src/utils/daemon-files.js';

/** 复刻 daemon build_file_tree 的真实输出形状(根 path=".") */
const daemonResponse: DaemonTreeNode = {
  path: '.',
  name: 'wrangler.rs',
  isDirectory: true,
  children: [
    {
      path: 'crates',
      name: 'crates',
      isDirectory: true,
      children: [
        {
          path: 'crates/wrangler',
          name: 'wrangler',
          isDirectory: true,
          children: [{ path: 'crates/wrangler/lib.rs', name: 'lib.rs' }],
        },
      ],
    },
    { path: 'README.md', name: 'README.md' },
    { path: 'Cargo.toml', name: 'Cargo.toml' },
  ],
};

describe('daemonTreeToProjectFiles', () => {
  it('drops the "." root and maps children recursively', () => {
    const files = daemonTreeToProjectFiles(daemonResponse);
    expect(files.map((f) => f.path)).toEqual(['crates', 'README.md', 'Cargo.toml']);
    const crates = files[0];
    expect(crates.isDirectory).toBe(true);
    expect(crates.children?.[0].children?.[0].path).toBe('crates/wrangler/lib.rs');
  });

  it('keeps file nodes lean (no children key, no isDirectory flag)', () => {
    const files = daemonTreeToProjectFiles(daemonResponse);
    const readme = files[1];
    expect(readme.isDirectory).toBeUndefined();
    expect(readme.children).toBeUndefined();
    expect('name' in readme).toBe(false);
  });

  it('returns empty array for a childless root', () => {
    expect(daemonTreeToProjectFiles({ path: '.', name: 'empty' })).toEqual([]);
    expect(
      daemonTreeToProjectFiles({ path: '.', name: 'd', isDirectory: true, children: [] })
    ).toEqual([]);
  });
});
