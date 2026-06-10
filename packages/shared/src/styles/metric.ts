import { css } from '@emotion/react';
import type { Theme } from '@agentskillmania/skill-ui-theme';

/**
 * Flex-wrap container for metric tiles (variable-width).
 * Tiles wrap to next line when row is full.
 */
export function metricsRow(theme: Theme) {
  return css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[1]};
    margin-bottom: ${theme.spacing[2]};
  `;
}

/**
 * CSS grid container for metric tiles (equal-width columns).
 * @param columns - Number of columns.
 */
export function metricGrid(theme: Theme, columns: number) {
  const cols = Array(columns).fill('1fr').join(' ');
  return css`
    display: grid;
    grid-template-columns: ${cols};
    gap: ${theme.spacing[1]};
  `;
}
