/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Statistic } from 'antd';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';

/** Props for the MetricTile component. */
export interface MetricTileProps {
  /** Statistic title label. */
  title: string;
  /** Statistic value — string for formatted values, number for raw counts. */
  value: string | number;
  /** Optional style override for the Statistic value (e.g. color: error). */
  valueStyle?: React.CSSProperties;
}

/** Tile style — background card for a single antd Statistic. */
const tileStyle = (theme: Theme) => css`
  background: ${theme.color.fillSecondary};
  border-radius: ${theme.radius.base};
  padding: ${theme.spacing['2']};
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

/**
 * MetricTile — small card wrapping antd Statistic with consistent styling.
 * Used for displaying metric values (step count, token count, etc.).
 */
export function MetricTile({ title, value, valueStyle }: MetricTileProps) {
  const theme = useTheme();
  return (
    <div css={tileStyle(theme)}>
      <Statistic title={title} value={value} styles={{ content: valueStyle }} />
    </div>
  );
}
