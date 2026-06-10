/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableRow } from '../../../src/components/ExpandableRow.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('ExpandableRow', () => {
  it('renders summary content', () => {
    render(
      <ExpandableRow
        renderSummary={() => <span>Item Title</span>}
        renderDetail={() => <span>Detail Content</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('Item Title')).toBeInTheDocument();
  });

  it('toggles detail on click', () => {
    render(
      <ExpandableRow
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
        renderDetail={() => <span>Detail Content</span>}
      />,
      { wrapper }
    );
    expect(screen.queryByText('Detail Content')).toBeNull();
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.getByText('Detail Content')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.queryByText('Detail Content')).toBeNull();
  });

  it('does not expand when expandable=false', () => {
    render(
      <ExpandableRow
        expandable={false}
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
        renderDetail={() => <span>Hidden</span>}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('respects defaultExpanded=true', () => {
    render(
      <ExpandableRow
        defaultExpanded
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>Default Open</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('Default Open')).toBeInTheDocument();
  });

  it('calls onToggle callback', () => {
    const onToggle = vi.fn();
    render(
      <ExpandableRow
        onToggle={onToggle}
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('shows chevron when showChevron=true', () => {
    const { container } = render(
      <ExpandableRow
        showChevron
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    // ChevronRight is rendered as an SVG when collapsed
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show chevron when showChevron=false (default)', () => {
    const { container } = render(
      <ExpandableRow
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    // No SVG chevron should be rendered
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });

  it('passes expanded state to renderSummary', () => {
    render(
      <ExpandableRow
        defaultExpanded
        renderSummary={({ expanded }) => <span>{expanded ? 'open' : 'closed'}</span>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('renders detail with code variant styles', () => {
    const { container } = render(
      <ExpandableRow
        defaultExpanded
        detailVariant="code"
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>{'{"key": "value"}'}</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('{"key": "value"}')).toBeInTheDocument();
    // Verify the detail container exists
    expect(container.querySelector('[data-testid="expandable-detail"]')).toBeTruthy();
  });

  it('does not render detail when renderDetail is not provided', () => {
    render(
      <ExpandableRow renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>} />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });
});
