/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';

import { FileTabs } from '../../../src/files/FileTabs.js';
import type { FileTab } from '../../../src/files/types.js';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const sampleTabs: FileTab[] = [
  { path: 'SKILL.md', label: 'SKILL.md' },
  { path: 'src/index.ts', label: 'index.ts', modified: true },
  { path: 'package.json', label: 'package.json' },
];

describe('FileTabs', () => {
  it('renders all tabs', () => {
    render(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />,
      { wrapper }
    );
    expect(screen.getByText('SKILL.md')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('shows unsaved indicator', () => {
    render(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />,
      { wrapper }
    );
    // Modified tab should show dot indicator
    const dot = screen.getByText('•');
    expect(dot).toBeInTheDocument();
  });

  it('clicking tab triggers switch', () => {
    const onChange = vi.fn();
    render(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={vi.fn()}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('package.json'));
    expect(onChange).toHaveBeenCalledWith('package.json');
  });

  it('clicking close button triggers close (not switch)', () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    render(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={onClose}
      />,
      { wrapper }
    );
    // Each tab has a close button (X icon)
    const closeButtons = screen.getAllByRole('button', { hidden: true });
    // Click the first close button
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders empty tab list correctly', () => {
    render(<FileTabs tabs={[]} activePath={null} onTabChange={vi.fn()} onTabClose={vi.fn()} />, {
      wrapper,
    });
    // Should not have any tab text
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('shows fallback icon for unknown file extensions', () => {
    const tabs: FileTab[] = [...sampleTabs, { path: 'Dockerfile', label: 'Dockerfile' }];
    render(
      <FileTabs tabs={tabs} activePath="SKILL.md" onTabChange={vi.fn()} onTabClose={vi.fn()} />,
      { wrapper }
    );
    // File with unknown extension should still render
    expect(screen.getByText('Dockerfile')).toBeInTheDocument();
  });
});
