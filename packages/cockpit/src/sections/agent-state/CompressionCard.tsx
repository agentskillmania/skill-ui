/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Statistic, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { CompressionData } from './types.js';
import {
  emptyTextStyle,
  metricTileStyle,
  metricsRowStyle,
  sectionLabelStyle,
  textBlockStyle,
} from './styles.js';

/** Props for CompressionCard. */
export interface CompressionCardProps {
  /** Compression state from colts AgentContext. */
  compression?: CompressionData | null;
}

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing[1]};
  height: auto;
  line-height: 1;
`;

/** Title row style. */
const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Format token counts into human-readable strings. */
function formatTokens(value: number | undefined): string {
  if (value == null) return '-';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

/** Format relative time from a unix timestamp (ms). */
function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp == null) return '-';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * CompressionCard displays the current compression state: anchor index,
 * removed token count, summary token count, and time since compression.
 * Summary text is shown directly, truncated by default, click to expand.
 */
export function CompressionCard({ compression }: CompressionCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const isEmpty = !compression;

  return (
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.compression.title')}
          </Typography.Text>
        </div>
      }
      extra={
        !isEmpty ? (
          <Button
            type="text"
            css={toggleBtnStyle(theme)}
            onClick={() => setCollapsed((prev) => !prev)}
            size="small"
            data-testid="compression-collapse"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </Button>
        ) : undefined
      }
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('agentState.compression.none')}
        </div>
      ) : !collapsed ? (
        <div>
          {/* Metrics row */}
          <div css={metricsRowStyle(theme)}>
            <div css={metricTileStyle(theme)}>
              <Statistic title={t('agentState.compression.anchor')} value={compression!.anchor} />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.removed')}
                value={formatTokens(compression!.removedTokenCount)}
                valueStyle={{ color: theme.color.error }}
              />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.summary')}
                value={formatTokens(compression!.summaryTokenCount)}
                valueStyle={{ color: theme.color.success }}
              />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic
                title={t('agentState.compression.at')}
                value={formatRelativeTime(compression!.compressedAt)}
              />
            </div>
          </div>

          {/* Summary text — shown directly, truncated, click to expand */}
          {compression!.summary && (
            <div>
              <div css={sectionLabelStyle(theme)}>
                {t('agentState.compression.summaryPreview')}
              </div>
              <div
                css={textBlockStyle(theme, summaryExpanded)}
                onClick={() => setSummaryExpanded((prev) => !prev)}
                data-testid="summary-toggle"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSummaryExpanded((prev) => !prev);
                  }
                }}
              >
                {compression!.summary}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}
