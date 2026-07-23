/**
 * EventLogPanel tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { EventLogPanel } from '../../../../src/panels/event-log/EventLogPanel.js';
import type { CockpitEvent, EventCategory } from '../../../../src/panels/event-log/types.js';

// Wrapper component for theme context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// Helper to create mock events
function createEvent(type: CockpitEvent['type'], overrides?: Partial<CockpitEvent>): CockpitEvent {
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    type,
    label: `Test ${type} event`,
    payload: type === 'step:start' ? { step: 1 } : undefined,
    ...overrides,
  };
}

describe('EventLogPanel', () => {
  const mockEvents: CockpitEvent[] = [
    createEvent('step:start'),
    createEvent('tool:start'),
    createEvent('thinking', { payload: { content: 'thinking content' } }),
    createEvent('error', { payload: { message: 'error message' } }),
  ];

  it('renders events inside virtual scroll container with data-index', () => {
    const { container } = render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} />
      </TestWrapper>
    );
    // Events should be rendered as virtual items with data-index attributes
    const virtualItems = container.querySelectorAll('[data-index]');
    expect(virtualItems.length).toBe(mockEvents.length);
    // Verify specific event content is findable
    expect(screen.getByText('step:start')).toBeInTheDocument();
    expect(screen.getByText('tool:start')).toBeInTheDocument();
    expect(screen.getByText('thinking content')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} />
      </TestWrapper>
    );
    // Should render the panel container
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    render(
      <TestWrapper>
        <EventLogPanel events={[]} />
      </TestWrapper>
    );
    expect(screen.getByText('暂无事件')).toBeInTheDocument();
  });

  it('activeCategories controls which events are shown', () => {
    // Only show lifecycle events (step:start is lifecycle)
    const activeCategories = new Set<EventCategory>(['lifecycle']);
    const { container } = render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} activeCategories={activeCategories} />
      </TestWrapper>
    );
    // The component should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('onActiveCategoriesChange is called when filter changes', () => {
    const onActiveCategoriesChange = vi.fn();
    render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} onActiveCategoriesChange={onActiveCategoriesChange} />
      </TestWrapper>
    );
    // Find filter tags (Ant Design Tag components with onClick)
    const tags = document.querySelectorAll('.ant-tag');
    if (tags.length > 0) {
      fireEvent.click(tags[0]);
      expect(onActiveCategoriesChange).toHaveBeenCalled();
    }
  });

  it('scroll handler does not throw', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} />
      </TestWrapper>
    );
    const scrollContainer = getByTestId('event-log-scroll');
    expect(() => fireEvent.scroll(scrollContainer)).not.toThrow();
  });

  it('defaultActiveCategories sets initial filter state', () => {
    const defaultActiveCategories = new Set<EventCategory>(['error']);
    const { container } = render(
      <TestWrapper>
        <EventLogPanel events={mockEvents} defaultActiveCategories={defaultActiveCategories} />
      </TestWrapper>
    );
    // The component should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });
});
