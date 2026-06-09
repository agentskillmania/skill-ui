/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ReviewPanel } from '../../src/panels/review/ReviewPanel.js';
import type { ReviewItem } from '../../src/types.js';

const baseItem = {
  source: 'lint' as const,
  timestamp: Date.now(),
};

const sampleItems: ReviewItem[] = [
  {
    ...baseItem,
    id: 'r1',
    severity: 'error',
    filePath: 'mcp.json',
    message: 'Invalid JSON: trailing comma',
    detail: 'Remove trailing comma on line 12',
  },
  {
    ...baseItem,
    id: 'r2',
    severity: 'warning',
    filePath: 'AGENT.md',
    message: 'Missing optional description field',
    detail: 'Consider adding a description for clarity',
  },
  {
    ...baseItem,
    id: 'r3',
    severity: 'info',
    message: 'Instructions are clear',
  },
  {
    ...baseItem,
    id: 'r4',
    severity: 'error',
    message: 'No detail on this one',
  },
];

describe('ReviewPanel', () => {
  // ─── Empty state ───

  it('shows empty state when items is undefined', () => {
    renderWithProviders(<ReviewPanel />);
    expect(screen.getByText('审核项将在此显示')).toBeTruthy();
  });

  it('shows empty state when items is empty array', () => {
    renderWithProviders(<ReviewPanel items={[]} />);
    expect(screen.getByText('审核项将在此显示')).toBeTruthy();
  });

  // ─── Rendering ───

  it('displays all review item messages', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    expect(screen.getByText('Invalid JSON: trailing comma')).toBeTruthy();
    expect(screen.getByText('Missing optional description field')).toBeTruthy();
    expect(screen.getByText('Instructions are clear')).toBeTruthy();
    expect(screen.getByText('No detail on this one')).toBeTruthy();
  });

  it('displays file paths for items that have one', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    expect(screen.getByText('mcp.json')).toBeTruthy();
    expect(screen.getByText('AGENT.md')).toBeTruthy();
  });

  // ─── Expand/collapse (core behavior) ───

  it('shows detail for error items by default (auto-expanded)', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // r1 is error with detail — should be visible immediately
    expect(screen.getByText('Remove trailing comma on line 12')).toBeTruthy();
  });

  it('hides detail for warning items by default (collapsed)', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // r2 is warning with detail — should NOT be visible
    expect(screen.queryByText('Consider adding a description for clarity')).toBeNull();
  });

  it('expands warning detail on click', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // Click the warning item row (the message text is inside the clickable row)
    fireEvent.click(screen.getByText('Missing optional description field'));
    // Now detail should be visible
    expect(screen.getByText('Consider adding a description for clarity')).toBeTruthy();
  });

  it('collapses error detail on click', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // r1 detail starts expanded
    expect(screen.getByText('Remove trailing comma on line 12')).toBeTruthy();
    // Click to collapse
    fireEvent.click(screen.getByText('Invalid JSON: trailing comma'));
    // Detail should disappear
    expect(screen.queryByText('Remove trailing comma on line 12')).toBeNull();
  });

  it('re-expands collapsed detail on second click', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // Collapse
    fireEvent.click(screen.getByText('Invalid JSON: trailing comma'));
    expect(screen.queryByText('Remove trailing comma on line 12')).toBeNull();
    // Re-expand
    fireEvent.click(screen.getByText('Invalid JSON: trailing comma'));
    expect(screen.getByText('Remove trailing comma on line 12')).toBeTruthy();
  });

  it('items without detail are not clickable (no expand/collapse)', () => {
    renderWithProviders(<ReviewPanel items={sampleItems} />);
    // r3 is info with no detail — clicking should not break anything
    fireEvent.click(screen.getByText('Instructions are clear'));
    // No crash, no detail appears — just verify it still renders
    expect(screen.getByText('Instructions are clear')).toBeTruthy();
  });

  // ─── Auto-scroll ───

  it('calls scrollTo when items change length', () => {
    const scrollToSpy = vi.fn();
    // Mock Element.prototype.scrollTo for jsdom
    const original = Element.prototype.scrollTo;
    Element.prototype.scrollTo = scrollToSpy;

    const { rerender } = renderWithProviders(<ReviewPanel items={[sampleItems[0]]} />);

    // Add a new item — triggers useEffect because length changes
    rerender(<ReviewPanel items={[sampleItems[0], sampleItems[1]]} />);

    expect(scrollToSpy).toHaveBeenCalled();

    Element.prototype.scrollTo = original;
  });

  // ─── No score display ───

  it('does not render any score element', () => {
    const { container } = renderWithProviders(<ReviewPanel items={sampleItems} />);
    // No element should contain a numeric score display
    // ReviewPanel log stream has no score at all — verify no text matches "/ 100" pattern
    expect(screen.queryByText(/\/ 100/)).toBeNull();
    expect(container.querySelector('[data-testid="score"]')).toBeNull();
  });
});
