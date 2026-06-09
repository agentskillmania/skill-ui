import { describe, it, expect } from 'vitest';
import {
  expandableDetailTransition,
  expandableSummaryHover,
} from '../../../src/styles/expandable.js';
import { lightTheme } from '@agentskillmania/skill-ui-theme';

describe('expandable styles', () => {
  it('expandableDetailTransition returns SerializedStyles', () => {
    const result = expandableDetailTransition(lightTheme, true);
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
  });

  it('expandableDetailTransition collapsed vs expanded differ', () => {
    const collapsed = expandableDetailTransition(lightTheme, false);
    const expanded = expandableDetailTransition(lightTheme, true);
    expect(collapsed.styles).not.toBe(expanded.styles);
  });

  it('expandableSummaryHover returns SerializedStyles', () => {
    const result = expandableSummaryHover(lightTheme);
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
  });
});
