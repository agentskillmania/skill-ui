/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Application preferences panel component.
 *
 * @module
 */

import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Card, Form, Input, Select, Radio, Button } from 'antd';
import { FolderOpen } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { PreferencesPanelProps, AppPreferences } from '../types.js';

/** Theme options for the radio group */
const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

/** Directory field with input + browse button (UI4: extracted to module scope) */
function DirectoryField({
  label,
  fieldKey,
  value,
  onBrowse,
  browseLabel,
  theme,
  disabled,
}: {
  label: string;
  fieldKey: keyof AppPreferences;
  value: string;
  onBrowse: () => void;
  browseLabel: string;
  theme: ReturnType<typeof useTheme>;
  disabled: boolean;
}) {
  return (
    <Form.Item label={label}>
      <div
        css={css`
          display: flex;
          gap: ${theme.spacing[2]};
        `}
      >
        <Input value={value} readOnly data-testid={`prefs-${fieldKey}`} />
        <Button
          icon={<FolderOpen size={14} />}
          onClick={onBrowse}
          disabled={disabled}
          data-testid={`prefs-${fieldKey}-browse`}
        >
          {browseLabel}
        </Button>
      </div>
    </Form.Item>
  );
}

/**
 * Application preferences panel.
 *
 * @remarks
 * Controlled form component for theme, language, and directory settings.
 * Renders two Card sections: Appearance and Directories.
 * Browse buttons delegate to the `onBrowseDirectory` callback so the consumer
 * can provide the actual directory picker (e.g. Electron `dialog.showOpenDialog`).
 * When `onBrowseDirectory` is not provided, browse buttons are disabled.
 *
 * @example
 * ```tsx
 * <PreferencesPanel
 *   value={preferences}
 *   onChange={(partial) => setPreferences(prev => ({ ...prev, ...partial }))}
 *   onBrowseDirectory={async (field) => {
 *     const result = await window.studio.dialog.showOpenDialog({
 *       properties: ['openDirectory'],
 *       title: `Select ${field}`,
 *     });
 *     return result.filePaths[0];
 *   }}
 * />
 * ```
 */
export function PreferencesPanel({
  value,
  onChange,
  onBrowseDirectory,
  className,
}: PreferencesPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  /** Open native folder picker via the consumer-provided callback */
  const handleBrowse = useCallback(
    async (field: keyof AppPreferences) => {
      if (!onBrowseDirectory) return;
      try {
        const path = await onBrowseDirectory(field);
        if (path !== undefined) {
          onChange({ [field]: path } as Partial<AppPreferences>);
        }
      } catch {
        // Dialog dismissed or failed — no action needed
      }
    },
    [onBrowseDirectory, onChange]
  );

  // DirectoryField is declared OUTSIDE the component body (UI4): defining it
  // inside PreferencesPanel caused React to see a new component type on every
  // render, unmounting and remounting the entire subtree (losing focus/state).
  // Now it's a stable external component that receives its dependencies as props.

  return (
    <div className={className}>
      {/* Appearance Section */}
      <Card
        size="small"
        title={t('prefs.appearance.title')}
        css={css`
          margin-bottom: ${theme.spacing[4]};
        `}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label={t('prefs.appearance.theme')}>
            <Radio.Group
              value={value.theme}
              onChange={(e) => onChange({ theme: e.target.value })}
              optionType="button"
              buttonStyle="solid"
              data-testid="prefs-theme"
            >
              {THEME_OPTIONS.map((opt) => (
                <Radio.Button key={opt} value={opt}>
                  {t(`theme.${opt}`)}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label={t('prefs.appearance.language')}>
            <Select
              value={value.language}
              onChange={(v) => onChange({ language: v })}
              options={[
                { value: 'zh-CN', label: t('language.zhCN') },
                { value: 'en-US', label: t('language.enUS') },
              ]}
              data-testid="prefs-language"
            />
          </Form.Item>
        </Form>
      </Card>

      {/* Directories Section */}
      <Card size="small" title={t('prefs.workspace.title')}>
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <DirectoryField
            label={t('prefs.workspace.defaultWorkspacePath')}
            fieldKey="defaultWorkspacePath"
            value={value.defaultWorkspacePath as string}
            onBrowse={() => handleBrowse('defaultWorkspacePath')}
            browseLabel={t('prefs.workspace.browse')}
            theme={theme}
            disabled={!onBrowseDirectory}
          />
          <DirectoryField
            label={t('prefs.workspace.defaultAgentsPath')}
            fieldKey="defaultAgentsPath"
            value={value.defaultAgentsPath as string}
            onBrowse={() => handleBrowse('defaultAgentsPath')}
            browseLabel={t('prefs.workspace.browse')}
            theme={theme}
            disabled={!onBrowseDirectory}
          />
          <DirectoryField
            label={t('prefs.workspace.defaultSkillsPath')}
            fieldKey="defaultSkillsPath"
            value={value.defaultSkillsPath as string}
            onBrowse={() => handleBrowse('defaultSkillsPath')}
            browseLabel={t('prefs.workspace.browse')}
            theme={theme}
            disabled={!onBrowseDirectory}
          />
        </Form>
      </Card>
    </div>
  );
}
