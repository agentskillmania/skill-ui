/**
 * Settings style utilities tests
 */
import { describe, it, expect } from 'vitest';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import {
  stepNumber,
  stepConnector,
  stepRow,
  stepContent,
  stepDescription,
} from '../../src/styles/index.js';

describe('settings style utilities', () => {
  it('stepNumber returns valid styles', () => {
    const s = stepNumber(lightTheme);
    expect(s.styles).toContain(lightTheme.radius.full);
    expect(s.styles).toContain(lightTheme.color.primary);
  });

  it('stepConnector returns valid styles', () => {
    const s = stepConnector(lightTheme);
    expect(s.styles).toContain('position: absolute');
    expect(s.styles).toContain(lightTheme.color.border);
  });

  it('stepRow returns valid styles', () => {
    const s = stepRow(lightTheme);
    expect(s.styles).toContain('display: flex');
    expect(s.styles).toContain(lightTheme.spacing[3]);
  });

  it('stepContent returns valid styles', () => {
    const s = stepContent(lightTheme);
    expect(s.styles).toContain('flex-direction: column');
    expect(s.styles).toContain('min-width: 0');
  });

  it('stepDescription returns valid styles', () => {
    const s = stepDescription(lightTheme);
    expect(s.styles).toContain(lightTheme.color.textTertiary);
  });
});
