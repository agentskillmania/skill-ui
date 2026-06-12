/** @jsxImportSource @emotion/react */
/**
 * @fileoverview MCP server configuration panel component.
 *
 * @module
 */

import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Card, Switch, Checkbox, Alert, Typography } from 'antd';
import { ExternalLink, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import {
  stepRow,
  stepNumber,
  stepConnector,
  stepContent,
  stepDescription,
} from '../styles/index.js';
import type { McpConfigPanelProps } from '../types.js';

const { Text } = Typography;

/**
 * Copyable command block — click to copy with tooltip hint and success message.
 * Uses Ant Design Typography.Paragraph copyable out of the box.
 *
 * @param props - Command text to display and copy
 */
function CopyableCommand({ command }: { command: string }) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
      <Typography.Paragraph
        copyable={{
          text: command,
          tooltips: [t('mcp.copyTooltip'), t('mcp.copiedTooltip')],
        }}
        css={css`
          && {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${theme.spacing[2]} ${theme.spacing[3]};
            background: ${theme.color.bgSpotlight};
            border: 1px solid ${theme.color.border};
            border-radius: ${theme.radius.md};
            font-family: ${theme.font.familyMono};
            font-size: ${theme.font.size.sm};
            color: ${theme.color.text};
            margin-bottom: 0;
            transition: border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
                        background ${theme.motion.duration.normal} ${theme.motion.easing.out};

            &:hover {
              border-color: ${theme.color.borderHover};
              background: ${theme.color.fill};
            }
          }
        `}
      >
        {command}
      </Typography.Paragraph>
  );
}

/**
 * MCP configuration panel.
 *
 * @remarks
 * Displays global MCP server toggle, a list of available servers with
 * per-server enable/disable checkboxes, and contextual guidance:
 * - No servers → step-by-step empty state card with numbered instructions
 * - Has servers → Alert hint bar above the list
 *
 * @example
 * ```tsx
 * <McpConfigPanel
 *   value={{
 *     loadGlobal: true,
 *     enabledServers: ['filesystem'],
 *     availableServers: [{ name: 'filesystem', command: 'npx @mcp/server-filesystem' }],
 *   }}
 *   onChange={setMcpConfig}
 * />
 * ```
 */
export function McpConfigPanel({
  value,
  onChange,
  className,
}: McpConfigPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const handleToggleGlobal = (checked: boolean) => {
    onChange({ ...value, loadGlobal: checked });
  };

  const handleToggleServer = (serverName: string, checked: boolean) => {
    const next = checked
      ? [...value.enabledServers, serverName]
      : value.enabledServers.filter((n) => n !== serverName);
    onChange({ ...value, enabledServers: next });
  };

  return (
    <div className={className}>
      {/* Global Toggle */}
      <Card size="small">
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
          `}
        >
          <div>
            <div
              css={css`
                font-size: ${theme.font.size.sm};
                font-weight: ${theme.font.weight.medium};
                color: ${theme.color.text};
              `}
            >
              {t('mcp.loadGlobal')}
            </div>
            <Text type="secondary" css={css`font-size: ${theme.font.size.xs};`}>
              {t('mcp.loadGlobalDesc')}
            </Text>
          </div>
          <Switch
            checked={value.loadGlobal}
            onChange={handleToggleGlobal}
            data-testid="mcp-loadGlobal"
          />
        </div>
      </Card>

      {/* Server section (visible when loadGlobal is on) */}
      {value.loadGlobal && (
        <div css={css`margin-top: ${theme.spacing[4]};`}>
          {/* Empty state: step-by-step guidance card */}
          {value.availableServers.length === 0 ? (
            <Card size="small" data-testid="mcp-empty-state">
              {/* Visual anchor icon */}
              <div
                css={css`
                  display: flex;
                  justify-content: center;
                  margin-bottom: ${theme.spacing[3]};
                `}
              >
                <Package
                  size={48}
                  css={css`
                    color: ${theme.color.textQuaternary};
                    opacity: 0.6;
                  `}
                />
              </div>

              {/* Title */}
              <div
                css={css`
                  font-size: ${theme.font.size.lg};
                  font-weight: ${theme.font.weight.semibold};
                  color: ${theme.color.text};
                  margin-bottom: ${theme.spacing[5]};
                  text-align: center;
                `}
              >
                {t('mcp.emptyTitle')}
              </div>

              {/* Steps container */}
              <div css={css`position: relative;`}>
                {/* Step 1: Install */}
                <div css={stepRow(theme)}>
                  <div css={stepNumber(theme)}>1</div>
                  <div css={stepContent(theme)}>
                    <div
                      css={css`
                        font-size: ${theme.font.size.sm};
                        font-weight: ${theme.font.weight.medium};
                        color: ${theme.color.text};
                      `}
                    >
                      {t('mcp.emptyStep1Title')}
                    </div>
                    <CopyableCommand command={t('mcp.emptyInstall')} />
                    <div css={stepDescription(theme)}>
                      {t('mcp.emptyHint')}
                    </div>
                  </div>
                </div>

                {/* Connector line between steps */}
                <div css={stepConnector(theme)} />

                {/* Step 2: Add server */}
                <div css={stepRow(theme)}>
                  <div css={stepNumber(theme)}>2</div>
                  <div css={stepContent(theme)}>
                    <div
                      css={css`
                        font-size: ${theme.font.size.sm};
                        font-weight: ${theme.font.weight.medium};
                        color: ${theme.color.text};
                      `}
                    >
                      {t('mcp.emptyStep2Title')}
                    </div>
                    <CopyableCommand command={t('mcp.emptyCommand')} />
                    <div css={stepDescription(theme)}>
                      {t('mcp.emptyStep2Desc')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Docs link */}
              <div
                css={css`
                  text-align: center;
                  margin-top: ${theme.spacing[5]};
                `}
              >
                <Typography.Link
                  href="https://mcporter.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={12} css={css`margin-right: 4px;`} />
                  {t('mcp.emptyDocs')}
                </Typography.Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Compact hint bar above server list */}
              <Alert
                type="info"
                showIcon
                css={css`margin-bottom: ${theme.spacing[4]};`}
                title={
                  <span>
                    {t('mcp.hintBar')}
                    {' — '}
                    <Typography.Link
                      href="https://mcporter.sh/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      mcporter.sh
                    </Typography.Link>
                  </span>
                }
                data-testid="mcp-hint-bar"
              />

              {/* Server list */}
              <Card size="small" title={t('mcp.availableServers')}>
                {value.availableServers.map((server) => {
                  const isEnabled = value.enabledServers.includes(server.name);
                  return (
                    <label
                      key={server.name}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: ${theme.spacing[2]};
                        padding: ${theme.spacing[2]} ${theme.spacing[3]};
                        border: 1px solid ${isEnabled ? theme.color.primary : theme.color.borderSecondary};
                        border-radius: ${theme.radius.md};
                        margin-bottom: ${theme.spacing[2]};
                        background: ${isEnabled ? (theme.color.primaryBg ?? theme.color.fillSubtle) : 'transparent'};
                        cursor: pointer;
                        transition: border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
                                    background ${theme.motion.duration.normal} ${theme.motion.easing.out};

                        &:hover {
                          background: ${theme.color.fillSubtle};
                        }

                        &:last-child {
                          margin-bottom: 0;
                        }
                      `}
                      data-testid={`mcp-server-${server.name}`}
                    >
                      <Checkbox
                        checked={isEnabled}
                        onChange={(e) => handleToggleServer(server.name, e.target.checked)}
                      />
                      <div css={css`flex: 1; min-width: 0;`}>
                        <div
                          css={css`
                            font-size: ${theme.font.size.sm};
                            font-weight: ${theme.font.weight.medium};
                            color: ${theme.color.text};
                          `}
                        >
                          {server.name}
                        </div>
                        <div
                          css={css`
                            font-size: ${theme.font.size.xs};
                            color: ${theme.color.textTertiary};
                            margin-top: 1px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                          `}
                        >
                          command: {server.command} {server.args?.join(' ')}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
