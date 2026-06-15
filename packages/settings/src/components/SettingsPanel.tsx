/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Top-level settings panel with tab navigation.
 *
 * @module
 */

import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Space, Tabs } from 'antd';
import { Server, Puzzle, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DaemonConfigPanel } from './DaemonConfigPanel.js';
import { McpConfigPanel } from './McpConfigPanel.js';
import { PreferencesPanel } from './PreferencesPanel.js';
import { NAMESPACE } from '../locales/index.js';
import type { DaemonConfig, AppPreferences, SettingsPanelProps } from '../types.js';

/**
 * Top-level settings panel with tabbed navigation.
 *
 * @remarks
 * Renders three tabs — Daemon, MCP Servers, Preferences. MCP config is applied
 * live; daemon config and preferences use a local draft that is only submitted
 * when the user clicks the Submit button. Reset reverts the draft to the last
 * prop snapshot.
 *
 * @example
 * ```tsx
 * <SettingsPanel
 *   daemonConfig={daemonConfig}
 *   onDaemonConfigSubmit={saveDaemonConfig}
 *   mcpConfig={mcpConfig}
 *   onMcpConfigChange={setMcpConfig}
 *   preferences={preferences}
 *   onPreferencesSubmit={savePreferences}
 * />
 * ```
 */
export function SettingsPanel({
  daemonConfig,
  onDaemonConfigSubmit,
  onDaemonConfigReset,
  mcpConfig,
  onMcpConfigChange,
  preferences,
  onPreferencesSubmit,
  onPreferencesReset,
  onBrowseDirectory,
  className,
}: SettingsPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const [draftDaemonConfig, setDraftDaemonConfig] = useState<DaemonConfig>(daemonConfig);
  const [draftPreferences, setDraftPreferences] = useState<AppPreferences>(preferences);

  useEffect(() => {
    setDraftDaemonConfig(daemonConfig);
  }, [daemonConfig]);

  useEffect(() => {
    setDraftPreferences(preferences);
  }, [preferences]);

  const handleDaemonSubmit = () => {
    onDaemonConfigSubmit(draftDaemonConfig);
  };

  const handleDaemonReset = () => {
    setDraftDaemonConfig(daemonConfig);
    onDaemonConfigReset?.();
  };

  const handlePreferencesSubmit = () => {
    onPreferencesSubmit(draftPreferences);
  };

  const handlePreferencesReset = () => {
    setDraftPreferences(preferences);
    onPreferencesReset?.();
  };

  const actionFooter = (onSubmit: () => void, onReset: () => void) => (
    <div
      css={css`
        display: flex;
        justify-content: flex-end;
        padding-top: ${theme.spacing[4]};
        border-top: 1px solid ${theme.color.border};
        margin-top: ${theme.spacing[4]};
      `}
    >
      <Space>
        <Button onClick={onReset}>{t('common.reset')}</Button>
        <Button type="primary" onClick={onSubmit}>
          {t('common.submit')}
        </Button>
      </Space>
    </div>
  );

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
        <>
          <PreferencesPanel
            value={draftPreferences}
            onChange={(partial) => setDraftPreferences((prev) => ({ ...prev, ...partial }))}
            onBrowseDirectory={onBrowseDirectory}
          />
          {actionFooter(handlePreferencesSubmit, handlePreferencesReset)}
        </>
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
        <>
          <DaemonConfigPanel
            value={draftDaemonConfig}
            onChange={(partial) => setDraftDaemonConfig((prev) => ({ ...prev, ...partial }))}
          />
          {actionFooter(handleDaemonSubmit, handleDaemonReset)}
        </>
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
      children: <McpConfigPanel value={mcpConfig} onChange={onMcpConfigChange} />,
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
        destroyOnHidden
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
