/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

import { CopyValue } from './CopyValue.js';

/** Props for the InfoRow component. */
export interface InfoRowProps {
  /** Label displayed on the left. */
  label: string;
  /** Text value passed to CopyValue for clipboard copy. */
  text: string;
  /** Value content rendered on the right (typically formatted value). */
  children: React.ReactNode;
}

/** Key-value row style. */
const rowStyle = (theme: ReturnType<typeof useTheme>) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing['2']};
  padding: 2px 0;
  font-size: ${theme.font.size.sm};
`;

const labelStyle = (theme: ReturnType<typeof useTheme>) => css`
  color: ${theme.color.textSecondary};
  flex-shrink: 0;
`;

/**
 * InfoRow — key-value display row with click-to-copy on the value.
 * Label on left, CopyValue on right.
 */
export function InfoRow({ label, text, children }: InfoRowProps) {
  const theme = useTheme();
  return (
    <div css={rowStyle(theme)}>
      <span css={labelStyle(theme)}>{label}</span>
      <CopyValue text={text}>{children}</CopyValue>
    </div>
  );
}
