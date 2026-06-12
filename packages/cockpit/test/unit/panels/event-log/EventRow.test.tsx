/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { EventRow } from '../../../../src/panels/event-log/EventRow.js';
import type { CockpitEvent } from '../../../../src/panels/event-log/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

// tool:start renders payload.name, so this produces predictable text "read_file"
const baseEvent: CockpitEvent = {
  id: 'e1',
  type: 'tool:start',
  timestamp: Date.now(),
  label: 'read_file',
  payload: { name: 'read_file' },
};

describe('EventRow', () => {
  it('renders event content text', () => {
    render(<EventRow event={baseEvent} />, { wrapper });
    expect(screen.getByText('read_file')).toBeInTheDocument();
  });

  it('renders event type tag', () => {
    render(<EventRow event={baseEvent} />, { wrapper });
    expect(screen.getByText('tool:start')).toBeInTheDocument();
  });

  it('does not show payload when collapsed', () => {
    const event: CockpitEvent = {
      ...baseEvent,
      payload: { name: 'read_file', model: 'claude-sonnet-4-6' },
    };
    render(<EventRow event={event} />, { wrapper });
    expect(screen.queryByText(/claude-sonnet-4-6/)).toBeNull();
  });

  it('expands payload on click', () => {
    const event: CockpitEvent = {
      ...baseEvent,
      payload: { name: 'read_file', model: 'claude-sonnet-4-6' },
    };
    render(<EventRow event={event} />, { wrapper });
    // Click the ExpandableRow summary
    const summary = screen.getByTestId('expandable-summary');
    fireEvent.click(summary);
    expect(screen.getByText(/claude-sonnet-4-6/)).toBeInTheDocument();
  });

  it('collapses payload on second click', () => {
    const event: CockpitEvent = {
      ...baseEvent,
      payload: { name: 'read_file', model: 'claude-sonnet-4-6' },
    };
    render(<EventRow event={event} />, { wrapper });
    const summary = screen.getByTestId('expandable-summary');
    fireEvent.click(summary);
    expect(screen.getByText(/claude-sonnet-4-6/)).toBeInTheDocument();
    fireEvent.click(summary);
    expect(screen.queryByText(/claude-sonnet-4-6/)).toBeNull();
  });

  it('calls onHeightChange when toggling expand', () => {
    const onHeightChange = vi.fn();
    const event: CockpitEvent = {
      ...baseEvent,
      payload: { name: 'read_file', model: 'claude-sonnet-4-6' },
    };
    render(<EventRow event={event} onHeightChange={onHeightChange} />, { wrapper });
    fireEvent.click(screen.getByTestId('expandable-summary'));
    expect(onHeightChange).toHaveBeenCalledOnce();
  });

  it('is not expandable when payload is empty', () => {
    const event: CockpitEvent = { ...baseEvent, payload: {} };
    render(<EventRow event={event} />, { wrapper });
    const summary = screen.getByTestId('expandable-summary');
    fireEvent.click(summary);
    expect(screen.queryByTestId('expandable-detail')).toBeNull();
  });

  it('is not expandable when payload is undefined', () => {
    const event: CockpitEvent = { ...baseEvent, payload: undefined };
    render(<EventRow event={event} />, { wrapper });
    const summary = screen.getByTestId('expandable-summary');
    fireEvent.click(summary);
    expect(screen.queryByTestId('expandable-detail')).toBeNull();
  });
});
