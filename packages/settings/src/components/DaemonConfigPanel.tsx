/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Daemon configuration panel component.
 *
 * @module
 */

import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Card, Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../locales/index.js';
import type { DaemonConfig, DaemonConfigPanelProps } from '../types.js';

/** Reasoning select options */
const REASONING_OPTIONS = [
  { value: 'auto', labelKey: 'reasoning.auto' },
  { value: 'true', labelKey: 'reasoning.enabled' },
  { value: 'false', labelKey: 'reasoning.disabled' },
] as const;

/**
 * Daemon configuration panel.
 *
 * @remarks
 * Controlled form component for editing `~/.agentskillmania/skill-studio/config.yaml`.
 * Renders two Card sections: LLM Connection and Server binding.
 * Fires `onChange` with partial updates on every field change.
 *
 * @example
 * ```tsx
 * <DaemonConfigPanel
 *   value={config}
 *   onChange={(partial) => setConfig(prev => ({ ...prev, ...partial }))}
 * />
 * ```
 */
export function DaemonConfigPanel({
  value,
  onChange,
  className,
}: DaemonConfigPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const handleLlmChange = (partial: Partial<DaemonConfig['llm']>) => {
    onChange({ llm: { ...value.llm, ...partial } });
  };

  return (
    <div className={className}>
      {/* LLM Connection Section */}
      <Card
        size="small"
        title={t('daemon.llm.title')}
        css={css`margin-bottom: ${theme.spacing[4]};`}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label={t('daemon.llm.baseUrl')} required>
            <Input
              value={value.llm.baseUrl}
              onChange={(e) => handleLlmChange({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              data-testid="daemon-llm-baseUrl"
            />
          </Form.Item>

          <Form.Item label={t('daemon.llm.apiKey')} required>
            <Input.Password
              value={value.llm.apiKey}
              onChange={(e) => handleLlmChange({ apiKey: e.target.value })}
              placeholder="sk-..."
              data-testid="daemon-llm-apiKey"
            />
          </Form.Item>

          <Form.Item label={t('daemon.llm.model')} required>
            <Input
              value={value.llm.model}
              onChange={(e) => handleLlmChange({ model: e.target.value })}
              placeholder="gpt-4o"
              data-testid="daemon-llm-model"
            />
          </Form.Item>

          <Form.Item label={t('daemon.llm.contextWindow')}>
            <InputNumber
              value={value.llm.contextWindow ?? undefined}
              onChange={(v) => handleLlmChange({ contextWindow: v ?? null })}
              placeholder="Auto"
              style={{ width: '100%' }}
              data-testid="daemon-llm-contextWindow"
            />
          </Form.Item>

          <Form.Item label={t('daemon.llm.maxTokens')}>
            <InputNumber
              value={value.llm.maxTokens ?? undefined}
              onChange={(v) => handleLlmChange({ maxTokens: v ?? null })}
              placeholder="Auto"
              style={{ width: '100%' }}
              data-testid="daemon-llm-maxTokens"
            />
          </Form.Item>

          <Form.Item label={t('daemon.llm.reasoning')}>
            <Select
              value={String(value.llm.reasoning ?? 'auto')}
              onChange={(v) => {
                const resolved = v === 'auto' ? 'auto' : v === 'true';
                handleLlmChange({ reasoning: resolved });
              }}
              options={REASONING_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
              }))}
              data-testid="daemon-llm-reasoning"
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
