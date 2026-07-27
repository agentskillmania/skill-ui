/**
 * eventCategory tests
 */
import { describe, it, expect } from 'vitest';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import {
  getEventCategory,
  getCategoryIcon,
  getEventColor,
  ALL_CATEGORIES,
} from '../../../../src/panels/event-log/eventCategory.js';
import type { CockpitEventType } from '../../../../src/panels/event-log/types.js';

describe('getEventCategory', () => {
  it('returns lifecycle for step:start', () => {
    expect(getEventCategory('step-start')).toBe('lifecycle');
  });

  it('returns lifecycle for step:end', () => {
    expect(getEventCategory('step-end')).toBe('lifecycle');
  });

  it('returns lifecycle for complete', () => {
    expect(getEventCategory('complete')).toBe('lifecycle');
  });

  it('returns lifecycle for abort', () => {
    expect(getEventCategory('abort')).toBe('lifecycle');
  });

  it('returns phase for phase-change', () => {
    expect(getEventCategory('phase-change')).toBe('phase');
  });

  it('returns thinking for thinking', () => {
    expect(getEventCategory('thinking')).toBe('thinking');
  });

  it('returns token for token', () => {
    expect(getEventCategory('token')).toBe('token');
  });

  it('returns llm for llm:request', () => {
    expect(getEventCategory('llm-request')).toBe('llm');
  });

  it('returns llm for llm:response', () => {
    expect(getEventCategory('llm-response')).toBe('llm');
  });

  it('returns tool for tool:start', () => {
    expect(getEventCategory('tool-start')).toBe('tool');
  });

  it('returns tool for tool:end', () => {
    expect(getEventCategory('tool-end')).toBe('tool');
  });

  it('returns tool for tools:start', () => {
    expect(getEventCategory('tools-start')).toBe('tool');
  });

  it('returns skill for skill:loading', () => {
    expect(getEventCategory('skill-loading')).toBe('skill');
  });

  it('returns skill for skill:loaded', () => {
    expect(getEventCategory('skill-loaded')).toBe('skill');
  });

  it('returns skill for skill:start', () => {
    expect(getEventCategory('skill-start')).toBe('skill');
  });

  it('returns skill for skill:end', () => {
    expect(getEventCategory('skill-end')).toBe('skill');
  });

  it('returns subagent for subagent:start', () => {
    expect(getEventCategory('subagent-start')).toBe('subagent');
  });

  it('returns subagent for subagent:end', () => {
    expect(getEventCategory('subagent-end')).toBe('subagent');
  });

  it('returns compressing for compressing', () => {
    expect(getEventCategory('compressing')).toBe('compressing');
  });

  it('returns human for waiting-human', () => {
    expect(getEventCategory('waiting-human')).toBe('human');
  });

  it('returns error for error', () => {
    expect(getEventCategory('error')).toBe('error');
  });

  it('returns undefined for unknown type', () => {
    expect(getEventCategory('unknown' as CockpitEventType)).toBeUndefined();
  });
});

describe('getCategoryIcon', () => {
  it('returns an icon for each category', () => {
    for (const cat of ALL_CATEGORIES) {
      const Icon = getCategoryIcon(cat);
      expect(Icon).toBeDefined();
    }
  });
});

describe('getEventColor', () => {
  it('returns color for known event type', () => {
    const color = getEventColor('thinking', lightTheme);
    expect(color.text).toBeDefined();
    expect(color.bg).toBeDefined();
  });

  it('returns fallback color for unknown type', () => {
    const color = getEventColor('unknown' as CockpitEventType, lightTheme);
    expect(color.text).toBe(lightTheme.color.textSecondary);
    expect(color.bg).toBe(lightTheme.color.fillTertiary);
  });
});
