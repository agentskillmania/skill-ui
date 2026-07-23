/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/** Props for the StatusDot component. */
export interface StatusDotProps {
  /** Whether the status is active/enabled. Defaults to true. */
  enabled?: boolean;
}

/** Status dot style — 5px circle indicating enabled/disabled state. */
const dotStyle = (theme: ReturnType<typeof useTheme>, enabled: boolean) => css`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${enabled ? theme.color.success : theme.color.textQuaternary};
`;

/**
 * StatusDot — small colored circle indicating enabled/disabled state.
 * Green for enabled, muted gray for disabled.
 */
export function StatusDot({ enabled = true }: StatusDotProps) {
  const theme = useTheme();
  return <div css={dotStyle(theme, enabled)} />;
}
