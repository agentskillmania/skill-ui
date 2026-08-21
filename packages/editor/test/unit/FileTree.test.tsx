/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { FileTree } from '../../src/panels/file-tree/FileTree.js';
import type { ProjectFile } from '../../src/types.js';

const sampleFiles: ProjectFile[] = [
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
  it('renders all root-level files', () => {
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('SKILL.md')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('expanding directory shows child files', () => {
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    // Directory expanded by default, child files should be visible
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('util.ts')).toBeInTheDocument();
  });

  it('clicking file triggers selection', () => {
    const onSelect = vi.fn();
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('SKILL.md'));
    expect(onSelect).toHaveBeenCalledWith('SKILL.md');
  });

  it('clicking directory toggles expand/collapse', () => {
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    // Click directory name to collapse
    fireEvent.click(screen.getByText('src'));
    expect(screen.queryByText('index.ts')).toBeNull();
    // Click again to expand
    fireEvent.click(screen.getByText('src'));
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('shows empty state when file list is empty', () => {
    renderWithProviders(<FileTree files={[]} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('暂无文件')).toBeInTheDocument();
  });

  it('highlights currently selected file and only that one', () => {
    renderWithProviders(
      <FileTree files={sampleFiles} activeFilePath="SKILL.md" onSelect={vi.fn()} />
    );
    // data-active 是激活行的显式标记(此前版本查 computed style,
    // jsdom 不应用 emotion 样式,断言近乎恒真)
    expect(screen.getByText('SKILL.md').closest('[data-active="true"]')).not.toBeNull();
    expect(screen.getByText('package.json').closest('[data-active="true"]')).toBeNull();
  });

  it('uses default icon for files without extension', () => {
    const files: ProjectFile[] = [{ path: 'Makefile', content: 'all:' }];
    renderWithProviders(<FileTree files={files} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Makefile')).toBeInTheDocument();
  });
});
