/**
 * Event log panel types
 */

/** Raw event types from colts framework — zero mapping */
export type CockpitEventType =
  | 'step:start'
  | 'step:end'
  | 'complete'
  | 'abort'
  | 'phase-change'
  | 'thinking'
  | 'token'
  | 'llm:request'
  | 'llm:response'
  | 'tool:start'
  | 'tool:end'
  | 'tools:start'
  | 'tools:end'
  | 'skill:loading'
  | 'skill:loaded'
  | 'skill:start'
  | 'skill:end'
  | 'subagent:start'
  | 'subagent:end'
  | 'compressing'
  | 'compressed'
  | 'waiting-human'
  | 'error';

/** UI filter categories derived from event type */
export type EventCategory =
  | 'lifecycle'
  | 'phase'
  | 'thinking'
  | 'token'
  | 'llm'
  | 'tool'
  | 'skill'
  | 'subagent'
  | 'compressing'
  | 'human'
  | 'error';

export interface CockpitEvent {
  id: string;
  timestamp: number;
  type: CockpitEventType;
  label: string;
  payload?: Record<string, unknown>;
  relatedMessageId?: string;
}

export interface EventLogPanelProps {
  events: CockpitEvent[];
  /** Controlled active categories filter */
  activeCategories?: Set<EventCategory>;
  /** Default active categories (uncontrolled) */
  defaultActiveCategories?: Set<EventCategory>;
  /** Callback when active categories change */
  onActiveCategoriesChange?: (categories: Set<EventCategory>) => void;
}
