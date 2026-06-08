/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { flexColumn, flexRow } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/** Section container — vertical stack of cards. Reuses session pattern. */
export const sectionStyle = (theme: Theme) => css`
  ${flexColumn(theme, '2')}
`;

/** Empty state text — muted, centered. */
export const emptyTextStyle = (theme: Theme) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.sm};
  padding: ${theme.spacing[1]} 0;
`;

/** Metric tile — small card with background for a single statistic. */
export const metricTileStyle = (theme: Theme) => css`
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.base};
  padding: ${theme.spacing[2]};
  text-align: center;

  .ant-statistic-title {
    font-size: 10px;
    color: ${theme.color.textSecondary};
    margin-bottom: 2px;
  }

  .ant-statistic-content {
    font-size: ${theme.font.size.base};
    font-weight: ${theme.font.weight.bold};
    color: ${theme.color.text};
  }
`;

/** Metrics row — horizontal flex wrap of metric tiles. */
export const metricsRowStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[1]};
  margin-bottom: ${theme.spacing[2]};
`;

/** Monospace text block — truncated by default, scrollable on expand. */
export const codeBlockStyle = (theme: Theme, isExpanded: boolean) => css`
  padding: ${theme.spacing[2]};
  background: ${theme.color.bgSecondary};
  border: 1px solid ${isExpanded ? theme.color.primary : 'transparent'};
  border-radius: ${theme.radius.md};
  margin-top: ${theme.spacing[2]};
  cursor: pointer;
  transition: border-color 0.15s;
  ${isExpanded ? 'max-height: 200px; overflow-y: auto;' : ''}

  &:hover {
    background: ${theme.color.fillSecondary};
  }

  pre {
    color: ${theme.color.textSecondary};
    font-size: ${theme.font.size.xs};
    line-height: 1.5;
    margin: 0;
    ${isExpanded
      ? 'white-space: pre-wrap; word-break: break-all;'
      : 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'}
  }
`;

/** Stack frame row — skill name + time. */
export const stackFrameStyle = (theme: Theme) => css`
  ${flexRow(theme, '1')};
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.base};

  & + & {
    margin-top: 2px;
  }
`;

/** Stack frames container — indented list. */
export const stackContainerStyle = (theme: Theme) => css`
  padding-left: ${theme.spacing[3]};
  ${flexColumn(theme, '0_5')};
  margin-top: ${theme.spacing[2]};
`;

/** Section label — muted uppercase label above a content block. */
export const sectionLabelStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.color.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: ${theme.spacing[1]};
`;

/** Truncated text block — for non-code content like summaries. */
export const textBlockStyle = (theme: Theme, isExpanded: boolean) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textSecondary};
  line-height: 1.5;
  padding: ${theme.spacing[2]};
  background: ${theme.color.bgSecondary};
  border: 1px solid ${isExpanded ? theme.color.primary : 'transparent'};
  border-radius: ${theme.radius.md};
  cursor: pointer;
  transition: border-color 0.15s;
  ${isExpanded ? 'max-height: 200px; overflow-y: auto;' : ''}

  &:hover {
    background: ${theme.color.fillSecondary};
  }

  ${isExpanded
    ? ''
    : `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;
