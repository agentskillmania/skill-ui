import { describe, it, expect } from 'vitest';
import { cardBodyTransition, cardHeaderInteractive } from '../../../src/styles/card.js';
import { lightTheme } from '@agentskillmania/skill-ui-theme';

describe('card styles', () => {
  it('cardBodyTransition returns SerializedStyles', () => {
    const result = cardBodyTransition(lightTheme, false);
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
  });

  it('cardBodyTransition collapsed produces different output than expanded', () => {
    const collapsed = cardBodyTransition(lightTheme, true);
    const expanded = cardBodyTransition(lightTheme, false);
    expect(collapsed.styles).not.toBe(expanded.styles);
  });

  it('cardHeaderInteractive returns SerializedStyles', () => {
    const result = cardHeaderInteractive(lightTheme);
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
  });
});
