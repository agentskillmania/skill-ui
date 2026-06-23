/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/** Empty state text — muted, centered. */
export const emptyTextStyle = (theme: Theme) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.sm};
  padding: ${theme.spacing[1]} 0;
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
