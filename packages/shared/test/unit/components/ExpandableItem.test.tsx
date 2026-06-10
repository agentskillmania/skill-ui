import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableItem } from '../../../src/components/ExpandableItem.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('ExpandableItem', () => {
  it('renders summary via renderSummary', () => {
    render(<ExpandableItem renderSummary={() => <span>Item Title</span>} />, { wrapper });
    expect(screen.getByText('Item Title')).toBeInTheDocument();
  });

  it('toggles detail on summary click when expandable', () => {
    render(
      <ExpandableItem
        expandable
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

  it('does not show detail when expandable=false', () => {
    render(
      <ExpandableItem
        expandable={false}
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
        renderDetail={() => <span>Hidden Detail</span>}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.queryByText('Hidden Detail')).toBeNull();
  });

  it('respects controlled expanded prop', () => {
    render(
      <ExpandableItem
        expanded={true}
        onToggle={() => {}}
        expandable
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>Always Visible</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('Always Visible')).toBeInTheDocument();
  });

  it('respects defaultExpanded prop', () => {
    render(
      <ExpandableItem
        defaultExpanded
        expandable
        renderSummary={() => <span>Summary</span>}
        renderDetail={() => <span>Default Open</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('Default Open')).toBeInTheDocument();
  });

  it('does not show detail when renderDetail is not provided', () => {
    render(
      <ExpandableItem
        expandable
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('calls onToggle callback', () => {
    const onToggle = vi.fn();
    render(
      <ExpandableItem
        expandable
        onToggle={onToggle}
        renderSummary={({ toggle }) => <button onClick={toggle}>Summary</button>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Summary'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('provides expanded state to renderSummary', () => {
    render(
      <ExpandableItem
        defaultExpanded
        expandable
        renderSummary={({ expanded }) => <span>{expanded ? 'open' : 'closed'}</span>}
        renderDetail={() => <span>Detail</span>}
      />,
      { wrapper }
    );
    expect(screen.getByText('open')).toBeInTheDocument();
  });
});
