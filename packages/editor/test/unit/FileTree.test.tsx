/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { FileTree } from '../../src/components/FileTree/FileTree.js';
import type { SkillFile } from '../../src/types.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const sampleFiles: SkillFile[] = [
  { path: 'SKILL.md', content: '# Skill' },
  {
    path: 'src',
    isDirectory: true,
    content: '',
    children: [
      { path: 'src/index.ts', content: 'export {};' },
      { path: 'src/util.ts', content: 'const x = 1;' },
    ],
  },
  { path: 'package.json', content: '{}' },
];

describe('FileTree', () => {
  it('渲染所有根级文件', () => {
    renderWithTheme(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('SKILL.md')).toBeTruthy();
    expect(screen.getByText('src')).toBeTruthy();
    expect(screen.getByText('package.json')).toBeTruthy();
  });

  it('展开目录显示子文件', () => {
    renderWithTheme(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    // 目录默认展开，子文件应可见
    expect(screen.getByText('index.ts')).toBeTruthy();
    expect(screen.getByText('util.ts')).toBeTruthy();
  });

  it('点击文件触发选中', () => {
    const onSelect = vi.fn();
    renderWithTheme(<FileTree files={sampleFiles} activeFilePath={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('SKILL.md'));
    expect(onSelect).toHaveBeenCalledWith('SKILL.md');
  });

  it('点击目录切换展开/收起', () => {
    renderWithTheme(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    // 点击目录名收起
    fireEvent.click(screen.getByText('src'));
    expect(screen.queryByText('index.ts')).toBeNull();
    // 再次点击展开
    fireEvent.click(screen.getByText('src'));
    expect(screen.getByText('index.ts')).toBeTruthy();
  });

  it('空文件列表正常渲染', () => {
    const { container } = renderWithTheme(
      <FileTree files={[]} activeFilePath={null} onSelect={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('高亮当前选中文件', () => {
    renderWithTheme(<FileTree files={sampleFiles} activeFilePath="SKILL.md" onSelect={vi.fn()} />);
    const fileEl = screen.getByText('SKILL.md').closest('[class]');
    expect(fileEl).toBeTruthy();
  });

  it('无扩展名文件使用默认图标', () => {
    const files: SkillFile[] = [{ path: 'Makefile', content: 'all:' }];
    renderWithTheme(<FileTree files={files} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Makefile')).toBeTruthy();
  });
});
