import { describe, it, expect } from 'vitest';
import { getFileInfo, getFileLabel } from '../../src/utils/file-utils.js';

describe('getFileInfo', () => {
  it('识别 TypeScript 文件', () => {
    const info = getFileInfo('src/index.ts');
    expect(info.extension).toBe('ts');
    expect(info.language).toBe('typescript');
  });

  it('识别 TSX 文件', () => {
    const info = getFileInfo('src/App.tsx');
    expect(info.extension).toBe('tsx');
    expect(info.language).toBe('typescript');
  });

  it('识别 JavaScript 文件', () => {
    const info = getFileInfo('script.js');
    expect(info.extension).toBe('js');
    expect(info.language).toBe('javascript');
  });

  it('识别 JSON 文件', () => {
    expect(getFileInfo('package.json').language).toBe('json');
  });

  it('识别 Markdown 文件', () => {
    expect(getFileInfo('SKILL.md').language).toBe('markdown');
  });

  it('识别 YAML 文件', () => {
    expect(getFileInfo('config.yaml').language).toBe('yaml');
    expect(getFileInfo('config.yml').language).toBe('yaml');
  });

  it('识别 Python 文件', () => {
    expect(getFileInfo('main.py').language).toBe('python');
  });

  it('识别 Shell 文件', () => {
    expect(getFileInfo('run.sh').language).toBe('shell');
    expect(getFileInfo('run.bash').language).toBe('shell');
  });

  it('未知扩展名降级为 plaintext', () => {
    expect(getFileInfo('data.xyz').language).toBe('plaintext');
  });

  it('无扩展名降级为 plaintext', () => {
    expect(getFileInfo('Makefile').language).toBe('plaintext');
    expect(getFileInfo('Makefile').extension).toBe('makefile');
  });
});

describe('getFileLabel', () => {
  it('从路径提取文件名', () => {
    expect(getFileLabel('src/index.ts')).toBe('index.ts');
  });

  it('根目录文件直接返回', () => {
    expect(getFileLabel('SKILL.md')).toBe('SKILL.md');
  });

  it('深层路径取最后一段', () => {
    expect(getFileLabel('a/b/c/d.txt')).toBe('d.txt');
  });

  it('空字符串路径返回空字符串', () => {
    expect(getFileLabel('')).toBe('');
  });
});
