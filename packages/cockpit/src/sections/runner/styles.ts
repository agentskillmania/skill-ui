/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { flexColumn, flexRow } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/** Section container — vertical stack of cards. Reuses session/agent-state pattern. */
export const sectionStyle = (theme: Theme) => css`
  ${flexColumn(theme, '2')}
`;

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

/** Tool group header — type label + count badge (used by SkillsCard). */
export const toolGroupHeaderStyle = (theme: Theme) => css`
  ${flexRow(theme, '1')};
  align-items: center;
  margin-top: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[1]};

  &:first-child {
    margin-top: 0;
  }
`;

/** Group label — type name (used by SkillsCard). */
export const groupLabelStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.color.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

/** Count badge — small muted pill. */
export const countBadgeStyle = (theme: Theme) => css`
  font-size: 10px;
  color: ${theme.color.textTertiary};
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.base};
  padding: 0 ${theme.spacing[1]};
  line-height: 18px;
`;

/** Tool item row — name + enabled badge + description toggle (used by SkillsCard). */
export const toolItemStyle = (theme: Theme) => css`
  ${flexRow(theme, '1')};
  align-items: center;
  padding: 2px ${theme.spacing[1]};
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.base};

  & + & {
    margin-top: 2px;
  }
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

/** Collapse header style — clickable row. */
export const collapseHeaderStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textSecondary};
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${theme.color.text};
  }
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

// ===== ToolsCard V2 styles (tab + two-line rows) =====

/**
 * Tool row style — two-line layout with click-to-expand description.
 * Line 1: status dot + tool name (monospace).
 * Line 2: description text, truncated by default, full on expand.
 */
export const toolRowStyle = (theme: Theme) => css`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  cursor: pointer;
  border-radius: ${theme.radius.base};
  transition: background 0.12s;

  &:hover {
    background: ${theme.color.fillSecondary};
  }
`;

/** Tool row top line — dot + name. */
export const toolRowTopStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Status dot — green for enabled, gray for disabled. */
export const statusDotStyle = (theme: Theme, enabled: boolean) => css`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${enabled ? theme.color.success : theme.color.textQuaternary};
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
