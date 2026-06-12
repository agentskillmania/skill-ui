/** @jsxImportSource @emotion/react */
import { memo } from 'react';
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme, flexColumn, flexRow } from '@agentskillmania/skill-ui-theme';
import { NAMESPACE } from '../../locales/index.js';
import type { SessionInfoData } from './types.js';
import {
  CollapsibleCard,
  useToggle,
  InfoRow,
  SectionLabel,
  formatNumber,
} from '@agentskillmania/skill-ui-shared';

/** Props for the SessionInfoCard component. */
export interface SessionInfoCardProps {
  /** Session detail data. */
  data: SessionInfoData;
  /** Whether the card starts collapsed. Defaults to false. */
  defaultCollapsed?: boolean;
}

/** Renders a code-styled text span for monospace values. */
const CodeValue = ({ children }: { children: React.ReactNode }) => (
  <Typography.Text code style={{ fontSize: '11px' }}>
    {children}
  </Typography.Text>
);

/** Renders a list of code-styled text spans for path arrays. */
const PathList = ({ items }: { items: string[] }) => {
  if (items.length === 0) return <span>-</span>;
  return (
    <span
      css={css`
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      `}
    >
      {items.map((item, i) => (
        <Typography.Text code key={i} style={{ fontSize: '11px' }}>
          {item}
        </Typography.Text>
      ))}
    </span>
  );
};

/** Card content with three info groups. */
const CardContent: React.FC<{ data: SessionInfoData }> = ({ data }) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        padding: ${useTheme().spacing['1']} 0;
      `}
    >
      {/* Identity group */}
      <SectionLabel>{t('session.info.identity')}</SectionLabel>
      <InfoRow label={t('session.info.sessionId')} text={data.sessionId}>
        <CodeValue>{data.sessionId}</CodeValue>
      </InfoRow>
      <InfoRow label={t('session.info.agent')} text={data.agentName}>
        {data.agentName}
      </InfoRow>
      <InfoRow label={t('session.info.agentConfig')} text={data.agentConfigPath ?? '-'}>
        {data.agentConfigPath ? <CodeValue>{data.agentConfigPath}</CodeValue> : '-'}
      </InfoRow>
      <InfoRow label={t('session.info.model')} text={data.model}>
        <CodeValue>{data.model}</CodeValue>
      </InfoRow>

      {/* Tokens group */}
      <SectionLabel>{t('session.info.tokens')}</SectionLabel>
      <InfoRow label={t('session.info.input')} text={formatNumber(data.tokensIn)}>
        <CodeValue>{formatNumber(data.tokensIn)}</CodeValue>
      </InfoRow>
      <InfoRow label={t('session.info.output')} text={formatNumber(data.tokensOut)}>
        <CodeValue>{formatNumber(data.tokensOut)}</CodeValue>
      </InfoRow>
      <InfoRow label={t('session.info.total')} text={formatNumber(data.tokensTotal)}>
        <CodeValue>{formatNumber(data.tokensTotal)}</CodeValue>
      </InfoRow>

      {/* Paths group */}
      <SectionLabel>{t('session.info.paths')}</SectionLabel>
      <InfoRow label={t('session.info.workspace')} text={data.workspacePath}>
        <CodeValue>{data.workspacePath}</CodeValue>
      </InfoRow>
      {data.sessionPath != null && (
        <InfoRow label={t('session.info.sessionDir')} text={data.sessionPath}>
          <CodeValue>{data.sessionPath}</CodeValue>
        </InfoRow>
      )}
      <InfoRow label={t('session.info.skillDirs')} text={data.skillDirs.join(', ') || '-'}>
        <PathList items={data.skillDirs} />
      </InfoRow>
      <InfoRow label={t('session.info.mcpConfigs')} text={data.mcpConfigPaths.join(', ') || '-'}>
        <PathList items={data.mcpConfigPaths} />
      </InfoRow>
    </div>
  );
};

/**
 * SessionInfoCard displays detailed session information in a compact card
 * with three info groups: Identity, Tokens, and Paths.
 */
export const SessionInfoCard: React.FC<SessionInfoCardProps> = memo(({
  data,
  defaultCollapsed = false,
}) => {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(defaultCollapsed);

  return (
    <CollapsibleCard
      title={
        <div
          css={css`
            ${flexRow(theme, '1')};
            align-items: center;
          `}
        >
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('session.info.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      <div
        css={css`
          ${flexColumn(theme, '2')}
        `}
      >
        <CardContent data={data} />
      </div>
    </CollapsibleCard>
  );
});
