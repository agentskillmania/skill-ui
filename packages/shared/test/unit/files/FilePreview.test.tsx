/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';

import { FilePreview } from '../../../src/files/FilePreview.js';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('FilePreview', () => {
  it('renders plain text as <pre> for code files', () => {
    render(<FilePreview path="src/index.ts" content={'const a = 1;\nconsole.log(a);'} />, {
      wrapper,
    });
    const pre = screen.getByText(/const a = 1;/).closest('pre');
    expect(pre).not.toBeNull();
  });

  it('renders markdown via XMarkdown for md files', () => {
    render(<FilePreview path="README.md" content={'# Title\n\nHello **world**'} />, { wrapper });
    // x-markdown renders the markdown content as HTML (h1 + strong)
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Title');
    expect(screen.getByText('world')).toBeInTheDocument();
  });

  it('escapes raw HTML in markdown to prevent XSS', () => {
    render(<FilePreview path="README.md" content={'<img src="x" onerror="alert(1)">safe'} />, {
      wrapper,
    });
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText(/safe/)).toBeInTheDocument();
  });

  it('falls back to <pre> for unknown extensions', () => {
    render(<FilePreview path="Dockerfile" content={'FROM node:20'} />, { wrapper });
    const pre = screen.getByText(/FROM node:20/).closest('pre');
    expect(pre).not.toBeNull();
  });
});
