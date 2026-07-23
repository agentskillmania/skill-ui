/** @jsxImportSource @emotion/react */
/**
 * EventLogPanel — agent runtime event log with type filtering
 * Merges consecutive streaming events (token, thinking) into single rows
 * Uses virtual scrolling (@tanstack/react-virtual) for performance with large lists.
 */
import { EmptyState, SidebarPanel } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ClipboardList } from 'lucide-react';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getEventCategory, ALL_CATEGORIES } from './eventCategory.js';
import { EventFilterBar } from './EventFilterBar.js';
import { EventRow } from './EventRow.js';
import type { CockpitEvent, EventLogPanelProps, EventCategory } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

/** Event types that should be merged when consecutive */
const MERGEABLE_TYPES: ReadonlySet<string> = new Set(['token', 'thinking']);

/**
 * Merge consecutive streaming events into single CockpitEvent rows.
 * Accumulates text in the payload's `text` field for merged events.
 */
function mergeStreamingEvents(events: CockpitEvent[]): CockpitEvent[] {
  const result: CockpitEvent[] = [];

  for (const event of events) {
    const last = result[result.length - 1];

    if (last && last.type === event.type && MERGEABLE_TYPES.has(event.type)) {
      // Append to the previous merged event
      const prevText = String(
        last.payload?.text ?? last.payload?.content ?? last.payload?.token ?? ''
      );
      const currText =
        event.type === 'token'
          ? String(event.payload?.token ?? '')
          : String(event.payload?.content ?? '');
      last.payload = {
        ...last.payload,
        text: prevText + currText,
        tokenCount: ((last.payload?.tokenCount as number) ?? 0) + 1,
      };
      // Use the latest timestamp
      last.timestamp = event.timestamp;
    } else {
      // Not mergeable or different type — push as-is
      result.push({ ...event, payload: { ...event.payload } });
    }
  }

  return result;
}

export function EventLogPanel({
  events = [],
  activeCategories: controlledCategories,
  defaultActiveCategories,
  onActiveCategoriesChange,
}: EventLogPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const [internalCategories, setInternalCategories] = useState<Set<EventCategory>>(
    () => defaultActiveCategories ?? new Set(ALL_CATEGORIES)
  );

  const activeCategories = controlledCategories ?? internalCategories;

  const setActiveCategories = (next: Set<EventCategory>) => {
    if (controlledCategories === undefined) {
      setInternalCategories(next);
    }
    onActiveCategoriesChange?.(next);
  };

  // Merge streaming events, then filter by category
  const displayEvents = useMemo(() => {
    const merged = mergeStreamingEvents(events);
    if (activeCategories.size === ALL_CATEGORIES.length) {
      return merged;
    }
    return merged.filter((e) => activeCategories.has(getEventCategory(e.type)));
  }, [events, activeCategories]);

  const virtualizer = useVirtualizer({
    count: displayEvents.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const totalSize = virtualizer.getTotalSize();
    shouldAutoScroll.current = (virtualizer.scrollOffset ?? 0) + el.clientHeight >= totalSize - 50;
  }, [virtualizer]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (shouldAutoScroll.current && displayEvents.length > 0) {
      virtualizer.scrollToIndex(displayEvents.length - 1, { align: 'end' });
    }
  }, [displayEvents.length, virtualizer]);

  // Re-measure a specific row (used by expanded/streaming rows)
  const handleRowHeightChange = useCallback(
    (index: number) => {
      const el = scrollRef.current?.querySelector(`[data-index="${index}"]`);
      if (el instanceof HTMLElement) {
        virtualizer.measureElement(el);
      }
    },
    [virtualizer]
  );

  // Re-measure last event when merged streaming content changes
  const lastEvent = displayEvents[displayEvents.length - 1];
  useEffect(() => {
    if (displayEvents.length === 0) return;
    handleRowHeightChange(displayEvents.length - 1);
  }, [displayEvents.length, lastEvent?.payload?.text, handleRowHeightChange]);

  const handleToggleCategory = (category: EventCategory) => {
    const next = new Set(activeCategories);
    if (next.has(category)) {
      // Don't allow deselecting all — keep at least 1 active
      if (next.size > 1) {
        next.delete(category);
      }
    } else {
      next.add(category);
    }
    setActiveCategories(next);
  };

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <SidebarPanel title={t('eventLogPanel.title')} icon={ClipboardList}>
      {events.length === 0 ? (
        <EmptyState description={t('eventLogPanel.noEvents')} />
      ) : (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            /* Override SidebarPanel's content padding so we control spacing */
            margin: -${theme.spacing[3]};
            padding: ${theme.spacing[3]};
          `}
        >
          {/* Fixed filter bar */}
          <EventFilterBar activeCategories={activeCategories} onToggle={handleToggleCategory} />
          {/* Virtual scroll container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            data-testid="event-log-scroll"
            css={css`
              flex: 1;
              min-height: 0;
              overflow-y: auto;
            `}
          >
            <div
              css={css`
                position: relative;
                height: ${virtualizer.getTotalSize()}px;
              `}
            >
              {virtualItems.map((vi) => (
                <div
                  key={vi.key}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  <EventRow
                    event={displayEvents[vi.index]}
                    onHeightChange={() => handleRowHeightChange(vi.index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SidebarPanel>
  );
}
