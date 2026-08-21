/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { FileTabs } from '../../src/sections/file-tabs/FileTabs.js';
import type { FileTab } from '../../src/types.js';

const sampleTabs: FileTab[] = [
  { path: 'SKILL.md', label: 'SKILL.md' },
  { path: 'src/index.ts', label: 'index.ts', modified: true },
  { path: 'package.json', label: 'package.json' },
];

describe('FileTabs', () => {
  it('renders all tabs', () => {
    renderWithProviders(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />
    );
    expect(screen.getByText('SKILL.md')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('shows unsaved indicator', () => {
    renderWithProviders(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />
    );
    // Modified tab should show dot indicator
    const dot = screen.getByText('•');
    expect(dot).toBeInTheDocument();
  });

  it('clicking tab triggers switch', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('package.json'));
    expect(onChange).toHaveBeenCalledWith('package.json');
  });

  it('clicking close button triggers close (not switch)', () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    renderWithProviders(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={onClose}
      />
    );
    // Each tab has a close button (X icon)
    const closeButtons = screen.getAllByRole('button', { hidden: true });
    // Click the first close button
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders empty tab list correctly', () => {
    renderWithProviders(
      <FileTabs tabs={[]} activePath={null} onTabChange={vi.fn()} onTabClose={vi.fn()} />
    );
    // Should not have any tab text
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('shows fallback icon for unknown file extensions', () => {
    const tabs: FileTab[] = [...sampleTabs, { path: 'Dockerfile', label: 'Dockerfile' }];
    renderWithProviders(
      <FileTabs tabs={tabs} activePath="SKILL.md" onTabChange={vi.fn()} onTabClose={vi.fn()} />
    );
    // File with unknown extension should still render
    expect(screen.getByText('Dockerfile')).toBeInTheDocument();
  });
});
