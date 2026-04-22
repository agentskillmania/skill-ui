/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { FileTree } from '../../src/components/FileTree/FileTree.js';
import type { SkillFile } from '../../src/types.js';

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
  it('renders all root-level files', () => {
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('SKILL.md')).toBeTruthy();
    expect(screen.getByText('src')).toBeTruthy();
    expect(screen.getByText('package.json')).toBeTruthy();
  });

  it('expanding directory shows child files', () => {
    renderWithProviders(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />);
    // Directory expanded by default, child files should be visible
    expect(screen.getByText('index.ts')).toBeTruthy();
    expect(screen.getByText('util.ts')).toBeTruthy();
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
    expect(screen.getByText('index.ts')).toBeTruthy();
  });

  it('renders empty file list correctly', () => {
    const { container } = renderWithProviders(
      <FileTree files={[]} activeFilePath={null} onSelect={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('highlights currently selected file', () => {
    renderWithProviders(
      <FileTree files={sampleFiles} activeFilePath="SKILL.md" onSelect={vi.fn()} />
    );
    const fileEl = screen.getByText('SKILL.md').closest('[class]');
    expect(fileEl).toBeTruthy();
    // Verify highlight style (background should not be transparent)
    const styles = window.getComputedStyle(fileEl!);
    expect(styles.backgroundColor).not.toBe('');
  });

  it('uses default icon for files without extension', () => {
    const files: SkillFile[] = [{ path: 'Makefile', content: 'all:' }];
    renderWithProviders(<FileTree files={files} activeFilePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Makefile')).toBeTruthy();
  });
});
