/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { flexColumn, flexRow } from '@agentskillmania/skill-ui-theme';

/** Section container — vertical stack of cards. */
export const sectionStyle = (theme: Theme) => css`
  ${flexColumn(theme, '2')}
`;

/** Card body content area. */
export const cardBodyStyle = (theme: Theme) => css`
  ${flexColumn(theme, '2')}
`;

/** Title row with status badge. */
export const titleRowStyle = (theme: Theme) => css`
  ${flexRow(theme, '1')}
  align-items: center;
`;

/** Metric grid — 2 columns. */
export const metricGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing['1']};
`;

/** Metric grid — 3 columns. */
export const metricGrid3ColStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${theme.spacing['1']};
`;

/** Footer row with timestamps. */
export const footerStyle = (theme: Theme) => css`
  ${flexRow(theme, '1')}
  justify-content: space-between;
`;
