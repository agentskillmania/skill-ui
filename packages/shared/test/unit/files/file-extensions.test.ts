import { describe, it, expect } from 'vitest';

import {
  getExtension,
  getFileKind,
  getFileLabel,
  isTextDoc,
  CODE_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  IMAGE_EXTENSIONS,
} from '../../../src/files/file-extensions.js';

describe('file-extensions', () => {
  it('getExtension returns lowercased extension without dot', () => {
    expect(getExtension('README.MD')).toBe('md');
    expect(getExtension('src/index.ts')).toBe('ts');
    expect(getExtension('Makefile')).toBe('makefile');
    expect(getExtension('')).toBe('');
  });

  it('getFileKind classifies markdown', () => {
    expect(getFileKind('a.md')).toBe('markdown');
    expect(getFileKind('a.mdx')).toBe('markdown');
  });

  it('getFileKind classifies image', () => {
    for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico']) {
      expect(getFileKind(`a.${ext}`)).toBe('image');
    }
  });

  it('getFileKind classifies code', () => {
    for (const ext of ['ts', 'tsx', 'js', 'json', 'css', 'py', 'go', 'rs']) {
      expect(getFileKind(`a.${ext}`)).toBe('code');
    }
  });

  it('getFileKind falls back to file for everything else', () => {
    expect(getFileKind('a.txt')).toBe('file');
    expect(getFileKind('a.rst')).toBe('file');
    expect(getFileKind('Makefile')).toBe('file');
    expect(getFileKind('a.zip')).toBe('file');
  });

  it('isTextDoc marks plain-text docs (icon细分 only, not a kind)', () => {
    expect(isTextDoc('a.txt')).toBe(true);
    expect(isTextDoc('a.rst')).toBe(true);
    expect(isTextDoc('a.adoc')).toBe(true);
    expect(isTextDoc('a.md')).toBe(false);
    expect(isTextDoc('a.ts')).toBe(false);
  });

  it('getFileLabel returns the last path segment', () => {
    expect(getFileLabel('src/components/FileTree.tsx')).toBe('FileTree.tsx');
    expect(getFileLabel('README.md')).toBe('README.md');
    expect(getFileLabel('')).toBe('');
  });

  it('extension tables stay disjoint across kinds', () => {
    const md = new Set(MARKDOWN_EXTENSIONS);
    const img = new Set(IMAGE_EXTENSIONS);
    for (const ext of CODE_EXTENSIONS) {
      expect(md.has(ext as never)).toBe(false);
      expect(img.has(ext as never)).toBe(false);
    }
  });
});
