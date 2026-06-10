/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Card, Typography, Tooltip, message } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { NAMESPACE } from '../../locales/index.js';
import type { SessionInfoData } from './types.js';
import { cardBodyStyle, titleRowStyle } from './styles.js';
import { useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for the SessionInfoCard component. */
export interface SessionInfoCardProps {
  /** Session detail data. */
  data: SessionInfoData;
  /** Whether the card starts collapsed. Defaults to false. */
  defaultCollapsed?: boolean;
}

/** Renders a code-styled text span for monospace values. */
const CodeValue = ({ children }: { children: React.ReactNode }) => (
  <Typography.Text code style={{ fontSize: '11px' }}>{children}</Typography.Text>
);

/** Renders a list of code-styled text spans for path arrays. */
const PathList = ({ items }: { items: string[] }) => {
  if (items.length === 0) return <span>-</span>;
  return (
    <span css={css`display: flex; flex-wrap: wrap; gap: 4px;`}>
      {items.map((item, i) => (
        <Typography.Text code key={i} style={{ fontSize: '11px' }}>
          {item}
        </Typography.Text>
      ))}
    </span>
  );
};

/** Group header styled as secondary uppercase label. */
const GroupHeader = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <div
      css={css`
        font-size: 10px;
        font-weight: ${theme.font.weight.semibold};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${theme.color.textSecondary};
        margin-bottom: ${theme.spacing['1']};
        margin-top: ${theme.spacing['2']};
        &:first-of-type { margin-top: 0; }
      `}
    >
      {children}
    </div>
  );
};

/** Click-to-copy value with ellipsis, antd tooltip, and message feedback. */
const CopyValue = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [messageApi, contextHolder] = message.useMessage();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      messageApi.success(t('session.info.copied'), 1.2);
    } catch {
      messageApi.error(t('session.info.copyFailed'));
    }
  };

  return (
    <>
      {contextHolder}
      <Tooltip title={text} placement="topRight">
        <span
          onClick={handleClick}
          css={css`
            color: ${theme.color.text};
            text-align: right;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60%;
            cursor: pointer;
            user-select: none;
            transition: color 0.15s;
            &:hover {
              color: ${theme.color.primary};
            }
          `}
        >
          {children}
        </span>
      </Tooltip>
    </>
  );
};

/** Single key-value row. */
const InfoRow = ({ label, text, children }: { label: string; text: string; children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <div
      css={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${theme.spacing['2']};
        padding: 2px 0;
        font-size: ${theme.font.size.sm};
      `}
    >
      <span css={css`color: ${theme.color.textSecondary}; flex-shrink: 0;`}>{label}</span>
      <CopyValue text={text}>{children}</CopyValue>
    </div>
  );
};

/** Format a number with locale, or return '-' for undefined. */
const formatNumber = (value: number | undefined): string => {
  if (value == null) return '-';
  return value.toLocaleString();
};

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing['1']};
  height: auto;
  line-height: 1;
`;

/** Card content with three info groups. */
const CardContent: React.FC<{ data: SessionInfoData }> = ({ data }) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <div css={css`padding: ${useTheme().spacing['1']} 0;`}>
      {/* Identity group */}
      <GroupHeader>{t('session.info.identity')}</GroupHeader>
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
      <GroupHeader>{t('session.info.tokens')}</GroupHeader>
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
      <GroupHeader>{t('session.info.paths')}</GroupHeader>
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
export const SessionInfoCard: React.FC<SessionInfoCardProps> = ({
  data,
  defaultCollapsed = false,
}) => {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(defaultCollapsed);

  return (
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('session.info.title')}
          </Typography.Text>
        </div>
      }
      extra={
        <Button
          type="text"
          css={toggleBtnStyle(theme)}
          onClick={collapsedToggle.toggle}
          data-testid="collapse-toggle"
          size="small"
        >
          {collapsedToggle.value ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </Button>
      }
    >
      {!collapsedToggle.value && (
        <div css={cardBodyStyle(theme)}>
          <CardContent data={data} />
        </div>
      )}
    </Card>
  );
};
