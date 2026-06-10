/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';

/** Props for the SectionLabel component. */
export interface SectionLabelProps {
  children: React.ReactNode;
}

/** Canonical section label style — uppercase muted label. */
const labelStyle = (theme: ReturnType<typeof useTheme>) => css`
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.color.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: ${theme.spacing[1]};
`;

/**
 * SectionLabel — muted uppercase label above a content block.
 * Canonical style: xs, semibold, textSecondary, uppercase, 0.3px letter-spacing.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  const theme = useTheme();
  return <div css={labelStyle(theme)}>{children}</div>;
}
