/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Top-level settings panel with tab navigation.
 *
 * @module
 */

import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Tabs } from 'antd';
import { Server, Puzzle, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import { DaemonConfigPanel } from './DaemonConfigPanel.js';
import { McpConfigPanel } from './McpConfigPanel.js';
import { PreferencesPanel } from './PreferencesPanel.js';
import type {
  SettingsPanelProps,
} from '../types.js';

/**
 * Top-level settings panel with tabbed navigation.
 *
 * @remarks
 * Renders three tabs — Daemon, MCP Servers, Preferences — each backed by
 * its corresponding panel component. The panel is a pure controlled component:
 * all state flows in via props and out via callbacks.
 *
 * @example
 * ```tsx
 * <SettingsPanel
 *   daemonConfig={daemonConfig}
 *   onDaemonConfigChange={setDaemonConfig}
 *   mcpConfig={mcpConfig}
 *   onMcpConfigChange={setMcpConfig}
 *   preferences={preferences}
 *   onPreferencesChange={setPreferences}
 * />
 * ```
 */
export function SettingsPanel({
  daemonConfig,
  onDaemonConfigChange,
  mcpConfig,
  onMcpConfigChange,
  preferences,
  onPreferencesChange,
  onBrowseDirectory,
  className,
}: SettingsPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const tabItems = [
    {
      key: 'prefs',
      label: (
        <span
          css={css`
            display: inline-flex;
            align-items: center;
            gap: 6px;
          `}
        >
          <Palette size={14} />
          {t('prefs.title')}
        </span>
      ),
      children: (
        <PreferencesPanel
          value={preferences}
          onChange={onPreferencesChange}
          onBrowseDirectory={onBrowseDirectory}
        />
      ),
    },
    {
      key: 'daemon',
      label: (
        <span
          css={css`
            display: inline-flex;
            align-items: center;
            gap: 6px;
          `}
        >
          <Server size={14} />
          {t('daemon.tab')}
        </span>
      ),
      children: (
        <DaemonConfigPanel
          value={daemonConfig}
          onChange={onDaemonConfigChange}
        />
      ),
    },
    {
      key: 'mcp',
      label: (
        <span
          css={css`
            display: inline-flex;
            align-items: center;
            gap: 6px;
          `}
        >
          <Puzzle size={14} />
          {t('mcp.title')}
        </span>
      ),
      children: (
        <McpConfigPanel
          value={mcpConfig}
          onChange={onMcpConfigChange}
        />
      ),
    },
  ];

  return (
    <div
      className={className}
      css={css`
        background: ${theme.color.bgContainer};
        border-radius: ${theme.radius.lg};
        box-shadow: ${theme.shadow.base};
        overflow: hidden;
      `}
    >
      <Tabs
        items={tabItems}
        css={css`
          .ant-tabs-nav {
            padding: 0 ${theme.spacing['4']};
            margin-bottom: 0;
          }

          .ant-tabs-content {
            padding: ${theme.spacing['4']};
            max-height: 480px;
            overflow-y: auto;
          }

          .ant-tabs-content::-webkit-scrollbar {
            width: 6px;
          }

          .ant-tabs-content::-webkit-scrollbar-thumb {
            background: ${theme.color.fillTertiary};
            border-radius: 3px;
          }

          .ant-tabs-content::-webkit-scrollbar-thumb:hover {
            background: ${theme.color.fillSecondary};
          }
        `}
      />
    </div>
  );
}
