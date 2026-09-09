/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';

import { FileTypeIcon } from '../../../src/files/FileTypeIcon.js';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('FileTypeIcon', () => {
  it('renders without crashing for each kind', () => {
    const paths = ['a.md', 'b.mdx', 'c.png', 'd.ts', 'e.txt', 'Makefile'];
    for (const p of paths) {
      const { container, unmount } = render(<FileTypeIcon path={p} />, { wrapper });
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('respects custom size', () => {
    const { container } = render(<FileTypeIcon path="a.md" size={20} />, { wrapper });
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('20');
    expect(svg?.getAttribute('height')).toBe('20');
  });

  it('is stable across kinds for the same path', () => {
    const a = render(<FileTypeIcon path="x.png" />, { wrapper });
    const first = a.container.querySelector('svg')?.outerHTML;
    a.unmount();
    const b = render(<FileTypeIcon path="x.png" />, { wrapper });
    expect(b.container.querySelector('svg')?.outerHTML).toBe(first);
    b.unmount();
  });
});
