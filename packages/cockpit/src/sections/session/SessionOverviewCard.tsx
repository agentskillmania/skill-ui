/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Progress, Statistic, Tag, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { NAMESPACE } from '../../locales/index.js';
import type { SessionOverviewData, SessionStatus } from './types.js';
import {
  cardBodyStyle,
  footerStyle,
  metricGrid3ColStyle,
  metricGridStyle,
  titleRowStyle,
} from './styles.js';
import { CollapsibleCard, useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for SessionOverviewCard. */
export interface SessionOverviewCardProps {
  /** Session overview data to display. */
  data: SessionOverviewData;
  /** Whether the card starts collapsed. Defaults to false. */
  defaultCollapsed?: boolean;
}

/** Format token counts into human-readable strings. */
function formatTokens(value: number | undefined): string {
  if (value === undefined) return '-';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

/** Format ISO timestamp to locale string, e.g. '6/5 14:32'. */
function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Resolve i18n key for session status. */
function statusI18nKey(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    running: 'session.overview.statusRunning',
    idle: 'session.overview.statusIdle',
    error: 'session.overview.statusError',
  };
  return map[status];
}

/** Map status to tag color token name. */
function statusTagColor(status: SessionStatus, theme: Theme): string {
  if (status === 'running') return theme.color.success;
  if (status === 'error') return theme.color.error;
  return theme.color.textTertiary;
}

/** Subtitle style — muted agent · model line. */
const subtitleStyle = (theme: Theme) => css`
  color: ${theme.color.textSecondary};
  font-size: ${theme.font.size.xs};
  margin-bottom: ${theme.spacing['2']};
`;

/** Context section spacing. */
const contextSectionStyle = (theme: Theme) => css`
  margin-top: ${theme.spacing['2']};
`;

/** Timestamp text style. */
const timestampStyle = (theme: Theme) => css`
  color: ${theme.color.textTertiary};
  font-size: ${theme.font.size.xs};
`;

/** Metric tile — small card with background for a single statistic. */
const metricTileStyle = (theme: Theme) => css`
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
 * SessionOverviewCard renders a collapsible card summarizing a session's
 * title, status, metrics, token usage, context window, and timestamps.
 */
export function SessionOverviewCard({ data, defaultCollapsed = false }: SessionOverviewCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(defaultCollapsed);

  const displayTitle = data.title || t('session.overview.titleFallback');
  const contextPercent =
    data.contextWindow && data.estimatedContextSize != null
      ? Math.min(Math.round((data.estimatedContextSize / data.contextWindow) * 100), 100)
      : undefined;

  const contextLabel = t('session.overview.contextLabel', {
    used: formatTokens(data.estimatedContextSize),
    limit: formatTokens(data.contextWindow),
  });

  return (
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {displayTitle}
          </Typography.Text>
          <Tag
            color={statusTagColor(data.status, theme)}
            style={{ fontSize: theme.font.size.xs, padding: '0 4px', lineHeight: '16px', margin: 0 }}
          >
            {t(statusI18nKey(data.status))}
          </Tag>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      <div css={cardBodyStyle(theme)}>
        {/* Agent · Model subtitle */}
        <div css={subtitleStyle(theme)}>
          {data.agentName} · {data.model}
        </div>

        {/* Steps & Messages — 2-col grid */}
        <div css={metricGridStyle(theme)}>
          <div css={metricTileStyle(theme)}>
            <Statistic title={t('session.overview.steps')} value={data.stepCount} />
          </div>
          <div css={metricTileStyle(theme)}>
            <Statistic title={t('session.overview.messages')} value={data.messageCount} />
          </div>
        </div>

        {/* Token metrics — 3-col grid */}
        <div css={metricGrid3ColStyle(theme)}>
          <div css={metricTileStyle(theme)}>
            <Statistic title={t('session.overview.tokensIn')} value={formatTokens(data.tokensIn)} />
          </div>
          <div css={metricTileStyle(theme)}>
            <Statistic title={t('session.overview.tokensOut')} value={formatTokens(data.tokensOut)} />
          </div>
          <div css={metricTileStyle(theme)}>
            <Statistic title={t('session.overview.tokensTotal')} value={formatTokens(data.tokensTotal)} />
          </div>
        </div>

        {/* Context usage progress bar */}
        {contextPercent !== undefined && (
          <div css={contextSectionStyle(theme)}>
            <div style={{ marginBottom: theme.spacing['1'], fontSize: theme.font.size.sm }}>
              {contextLabel}
            </div>
            <Progress
              percent={contextPercent}
              showInfo={false}
              strokeColor={theme.color.purple}
              size="small"
            />
          </div>
        )}

        {/* Timestamps footer */}
        <div css={footerStyle(theme)}>
          <span css={timestampStyle(theme)}>
            {t('session.overview.created', { time: formatTimestamp(data.createdAt) })}
          </span>
          <span css={timestampStyle(theme)}>
            {t('session.overview.updated', { time: formatTimestamp(data.updatedAt) })}
          </span>
        </div>
      </div>
    </CollapsibleCard>
  );
}
