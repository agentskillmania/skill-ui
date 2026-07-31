/**
 * Per-type event content renderers
 * Each returns concise text — the tag already identifies the event type,
 * so content only needs the distinguishing detail.
 */
import { truncate } from '@agentskillmania/skill-ui-shared';

import type { CockpitEvent } from './types.js';

/** Render event content text based on event type */
export function renderEventContent(event: CockpitEvent, expanded: boolean): string {
  const p = event.payload ?? {};
  switch (event.type) {
    case 'step-start':
    case 'step-end':
      return `#${p.step ?? '?'}`;
    case 'complete':
    case 'done':
      return '✓';
    case 'abort':
      return `✕ @ step ${p.step ?? '?'}`;
    case 'phase-change': {
      // from/to may be a string ("idle") or an object ({ type: 'idle' })
      const fromVal = p.from as { type?: string } | string | undefined;
      const toVal = p.to as { type?: string } | string | undefined;
      const fromStr = typeof fromVal === 'string' ? fromVal : (fromVal?.type ?? '?');
      const toStr = typeof toVal === 'string' ? toVal : (toVal?.type ?? '?');
      return `${fromStr} → ${toStr}`;
    }
    case 'thinking':
      return expanded ? String(p.content ?? '...') : truncate(String(p.content ?? '...'), 60);
    case 'token': {
      // After merging, payload.text holds accumulated text
      const text = String(p.text ?? p.delta ?? p.token ?? '');
      return expanded ? text : truncate(text, 60);
    }
    case 'llm-request': {
      const skill = p.skill as { current: string | null } | null;
      return skill?.current
        ? `${skill.current} · ${Array.isArray(p.messages) ? p.messages.length : '?'} msgs`
        : `${Array.isArray(p.messages) ? p.messages.length : '?'} messages`;
    }
    case 'llm-response': {
      const text = String(p.text ?? '');
      const tcCount = Array.isArray(p.toolCalls) ? (p.toolCalls as unknown[]).length : 0;
      return text ? truncate(text, 50) : `${tcCount} tool call${tcCount !== 1 ? 's' : ''}`;
    }
    case 'tool-start':
      return String(p.name ?? '?');
    case 'tool-end': {
      const result = String(p.result ?? '');
      return truncate(result, 60);
    }
    case 'tools-start':
      return `${Array.isArray(p.actions) ? p.actions.length : '?'} tools`;
    case 'tools-end':
      return `${Array.isArray(p.results) ? Object.keys(p.results as unknown as Record<string, unknown>).length : '?'} results`;
    case 'skill-loading':
      return String(p.name ?? '?');
    case 'skill-loaded':
      return `${p.name ?? '?'} · ${p.tokenCount ?? '?'} tokens`;
    case 'skill-start':
      return `${p.name ?? '?'}: ${truncate(String(p.task ?? ''), 40)}`;
    case 'skill-end':
      return String(p.name ?? '?');
    case 'subagent-start':
      return `${p.name ?? '?'}: ${truncate(String(p.task ?? ''), 40)}`;
    case 'subagent-end':
      return String(p.name ?? '?');
    case 'subagent-token': {
      const text = String(p.text ?? p.delta ?? p.token ?? '');
      return expanded ? text : truncate(text, 60);
    }
    case 'subagent-thinking':
      return expanded ? String(p.content ?? '...') : truncate(String(p.content ?? '...'), 60);
    case 'subagent-tool-start': {
      const action = p.action as { name?: string; tool?: string } | undefined;
      return `[${p.name ?? p.subagentName ?? '?'}] ${action?.name ?? action?.tool ?? '?'}`;
    }
    case 'subagent-tool-end': {
      const result = String(p.result ?? '');
      return `[${p.name ?? p.subagentName ?? '?'}] ${truncate(result, 50)}`;
    }
    case 'compressing':
      return '...';
    case 'compressed':
      return `-${p.removedCount ?? '?'} msgs`;
    case 'waiting-human':
    case 'human-input':
      return '⏸';
    case 'human-input-resolved':
      return '▶';
    case 'user-message':
      return truncate(String(p.content ?? ''), 60);
    case 'error':
      return String(p.message ?? p.error ?? 'Unknown');
    default:
      return event.label || event.type;
  }
}
