/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';

import { FileTree } from '../../../src/files/FileTree.js';
import type { FileNode } from '../../../src/files/types.js';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const sampleFiles: FileNode[] = [
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
    render(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('SKILL.md')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('expanding directory shows child files', () => {
    render(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />, { wrapper });
    // Directory expanded by default, child files should be visible
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('util.ts')).toBeInTheDocument();
  });

  it('clicking file triggers selection', () => {
    const onSelect = vi.fn();
    render(<FileTree files={sampleFiles} activeFilePath={null} onSelect={onSelect} />, { wrapper });
    fireEvent.click(screen.getByText('SKILL.md'));
    expect(onSelect).toHaveBeenCalledWith('SKILL.md');
  });

  it('clicking directory toggles expand/collapse', () => {
    render(<FileTree files={sampleFiles} activeFilePath={null} onSelect={vi.fn()} />, { wrapper });
    // Click directory name to collapse
    fireEvent.click(screen.getByText('src'));
    expect(screen.queryByText('index.ts')).toBeNull();
    // Click again to expand
    fireEvent.click(screen.getByText('src'));
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('shows empty state when file list is empty', () => {
    render(<FileTree files={[]} activeFilePath={null} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('fileTree.emptyHint')).toBeInTheDocument();
  });

  it('highlights currently selected file and only that one', () => {
    render(<FileTree files={sampleFiles} activeFilePath="SKILL.md" onSelect={vi.fn()} />, {
      wrapper,
    });
    // data-active 是激活行的显式标记(此前版本查 computed style,
    // jsdom 不应用 emotion 样式,断言近乎恒真)
    expect(screen.getByText('SKILL.md').closest('[data-active="true"]')).not.toBeNull();
    expect(screen.getByText('package.json').closest('[data-active="true"]')).toBeNull();
  });

  it('uses default icon for files without extension', () => {
    const files: FileNode[] = [{ path: 'Makefile', content: 'all:' }];
    render(<FileTree files={files} activeFilePath={null} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('Makefile')).toBeInTheDocument();
  });
});
