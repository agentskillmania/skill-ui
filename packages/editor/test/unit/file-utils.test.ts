import { describe, it, expect, vi } from 'vitest';
import { getFileInfo, getFileLabel } from '../../src/shared/file-utils.js';

describe('getFileInfo', () => {
  it('recognizes TypeScript files', () => {
    const info = getFileInfo('src/index.ts');
    expect(info.extension).toBe('ts');
    expect(info.language).toBe('typescript');
  });

  it('recognizes TSX files', () => {
    const info = getFileInfo('src/App.tsx');
    expect(info.extension).toBe('tsx');
    expect(info.language).toBe('typescript');
  });

  it('recognizes JavaScript files', () => {
    const info = getFileInfo('script.js');
    expect(info.extension).toBe('js');
    expect(info.language).toBe('javascript');
  });

  it('recognizes JSON files', () => {
    expect(getFileInfo('package.json').language).toBe('json');
  });

  it('recognizes Markdown files', () => {
    expect(getFileInfo('SKILL.md').language).toBe('markdown');
  });

  it('recognizes YAML files', () => {
    expect(getFileInfo('config.yaml').language).toBe('yaml');
    expect(getFileInfo('config.yml').language).toBe('yaml');
  });

  it('recognizes Python files', () => {
    expect(getFileInfo('main.py').language).toBe('python');
  });

  it('recognizes Shell files', () => {
    expect(getFileInfo('run.sh').language).toBe('shell');
    expect(getFileInfo('run.bash').language).toBe('shell');
  });

  it('falls back to plaintext for unknown extensions', () => {
    expect(getFileInfo('data.xyz').language).toBe('plaintext');
  });

  it('falls back to plaintext for files without extension', () => {
    expect(getFileInfo('Makefile').language).toBe('plaintext');
    expect(getFileInfo('Makefile').extension).toBe('makefile');
  });

  it('handles empty extension from trailing dot', () => {
    const result = getFileInfo('file.');
    expect(result.extension).toBe('');
    expect(result.language).toBe('plaintext');
  });

  it('handles empty array from split via optional chaining bridge', () => {
    const splitSpy = vi.spyOn(String.prototype, 'split');
    // Make split return empty array so pop() returns undefined
    splitSpy.mockReturnValueOnce([]);
    const result = getFileInfo('test');
    expect(result.extension).toBe('');
    expect(result.language).toBe('plaintext');
    splitSpy.mockRestore();
  });
});

describe('getFileLabel', () => {
  it('extracts file name from path', () => {
    expect(getFileLabel('src/index.ts')).toBe('index.ts');
  });

  it('returns root files directly', () => {
    expect(getFileLabel('SKILL.md')).toBe('SKILL.md');
  });

  it('takes last segment for deep paths', () => {
    expect(getFileLabel('a/b/c/d.txt')).toBe('d.txt');
  });

  it('returns empty string for empty path', () => {
    expect(getFileLabel('')).toBe('');
  });

  it('handles empty array from split via nullish coalescing bridge', () => {
    const splitSpy = vi.spyOn(String.prototype, 'split');
    // Make split return empty array so pop() returns undefined
    splitSpy.mockReturnValueOnce([]);
    const result = getFileLabel('some/path/file.ts');
    expect(result).toBe('some/path/file.ts');
    splitSpy.mockRestore();
  });
});
