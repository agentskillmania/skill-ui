import { describe, it, expect } from 'vitest';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { metricsRow, metricGrid } from '../../../src/styles/metric.js';

describe('metricsRow', () => {
  it('returns flex-wrap layout with gap', () => {
    const s = metricsRow(lightTheme);
    expect(s.styles).toContain('flex-wrap: wrap');
    expect(s.styles).toContain(lightTheme.spacing[1]);
    expect(s.styles).toContain(lightTheme.spacing[2]);
  });
});

describe('metricGrid', () => {
  it('returns 2-column grid', () => {
    const s = metricGrid(lightTheme, 2);
    expect(s.styles).toContain('grid-template-columns: 1fr 1fr');
    expect(s.styles).toContain(lightTheme.spacing[1]);
  });

  it('returns 3-column grid', () => {
    const s = metricGrid(lightTheme, 3);
    expect(s.styles).toContain('grid-template-columns: 1fr 1fr 1fr');
  });
});
