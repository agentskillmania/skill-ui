/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Application preferences panel component.
 *
 * @module
 */

import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Card, Form, Input, Select, Radio, Button } from 'antd';
import { FolderOpen } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import type { PreferencesPanelProps, AppPreferences } from '../types.js';

/** Theme options for the radio group */
const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

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
    [onBrowseDirectory, onChange],
  );

  /** Directory field with input + browse button */
  function DirectoryField({ label, fieldKey }: { label: string; fieldKey: keyof AppPreferences }) {
    return (
      <Form.Item label={label}>
        <div css={css`display: flex; gap: ${theme.spacing[2]};`}>
          <Input
            value={value[fieldKey] as string}
            readOnly
            data-testid={`prefs-${fieldKey}`}
          />
          <Button
            icon={<FolderOpen size={14} />}
            onClick={() => handleBrowse(fieldKey)}
            disabled={!onBrowseDirectory}
            data-testid={`prefs-${fieldKey}-browse`}
          >
            {t('prefs.workspace.browse')}
          </Button>
        </div>
      </Form.Item>
    );
  }

  return (
    <div className={className}>
      {/* Appearance Section */}
      <Card
        size="small"
        title={t('prefs.appearance.title')}
        css={css`margin-bottom: ${theme.spacing[4]};`}
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
          />
          <DirectoryField
            label={t('prefs.workspace.defaultAgentsPath')}
            fieldKey="defaultAgentsPath"
          />
          <DirectoryField
            label={t('prefs.workspace.defaultSkillsPath')}
            fieldKey="defaultSkillsPath"
          />
        </Form>
      </Card>
    </div>
  );
}
