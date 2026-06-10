/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/** Empty state text — muted, centered. */
export const emptyTextStyle = (theme: Theme) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.sm};
  padding: ${theme.spacing[1]} 0;
`;

/** Tag row — horizontal flex wrap for feature tags. */
export const tagRowStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[1]};
`;

/** Tool/skill name — monospace for technical names. */
export const itemNameStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  font-family: ${theme.font.familyCode};
  color: ${theme.color.text};
`;

/** Skill source path — muted monospace. */
export const sourcePathStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  font-family: ${theme.font.familyCode};
  color: ${theme.color.textTertiary};
  margin-left: auto;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Collapsible description area. */
export const descriptionStyle = (theme: Theme) => css`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  color: ${theme.color.textSecondary};
  font-size: ${theme.font.size.xs};
  line-height: 1.5;
`;

/** Title row style. */
export const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Tool row top line — dot + name. */
export const toolRowTopStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Tool name — monospace, strikethrough when disabled. */
export const toolNameStyle = (theme: Theme, enabled: boolean) => css`
  font-size: ${theme.font.size.sm};
  font-family: ${theme.font.familyCode};
  color: ${enabled ? theme.color.text : theme.color.textQuaternary};
  ${!enabled && `text-decoration: line-through;`}
`;

/** Tool description — indented below name, truncated or full. */
export const toolDescStyle = (theme: Theme, isExpanded: boolean) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  margin-top: 2px;
  padding-left: 13px;
  line-height: 1.45;
  ${isExpanded
    ? ''
    : `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  `}
`;

/** Tab count badge — muted number next to type label. */
export const tabCountStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textQuaternary};
  margin-left: 2px;
`;
