/** @jsxImportSource @emotion/react */
/**
 * EventLogPanel — agent runtime event log with type filtering
 * Merges consecutive streaming events (token, thinking) into single rows
 */
import { css } from '@emotion/react';
import { useState, useMemo } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, SidebarPanel } from '@agentskillmania/skill-ui-shared';
import type { CockpitEvent, EventLogPanelProps, EventCategory } from './types.js';
import { getEventCategory, ALL_CATEGORIES } from './eventCategory.js';
import { EventFilterBar } from './EventFilterBar.js';
import { EventRow } from './EventRow.js';
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

export function EventLogPanel({ events = [] }: EventLogPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    () => new Set(ALL_CATEGORIES)
  );

  // Merge streaming events, then filter by category
  const displayEvents = useMemo(() => {
    const merged = mergeStreamingEvents(events);
    if (activeCategories.size === ALL_CATEGORIES.length) {
      return merged;
    }
    return merged.filter((e) => activeCategories.has(getEventCategory(e.type)));
  }, [events, activeCategories]);

  const handleToggleCategory = (category: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        // Don't allow deselecting all — keep at least 1 active
        if (next.size > 1) {
          next.delete(category);
        }
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
          {/* Scrollable event list */}
          <div
            css={css`
              flex: 1;
              min-height: 0;
              overflow-y: auto;
            `}
          >
            {displayEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </SidebarPanel>
  );
}
