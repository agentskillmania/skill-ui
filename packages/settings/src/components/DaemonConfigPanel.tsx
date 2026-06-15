/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Daemon configuration panel component.
 *
 * @module
 */

import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Form, Input, InputNumber, Select } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { DaemonConfig, DaemonConfigPanelProps, LlmProviderEntry } from '../types.js';

const REASONING_OPTIONS = [
  { value: 'auto', labelKey: 'reasoning.auto' },
  { value: 'true', labelKey: 'reasoning.enabled' },
  { value: 'false', labelKey: 'reasoning.disabled' },
] as const;

const emptyProvider = (): LlmProviderEntry => ({
  name: '',
  apiKey: '',
  models: [{ modelId: '' }],
});

/**
 * Daemon configuration panel.
 *
 * @remarks
 * Controlled form component for editing `~/.agentskillmania/skill-studio/config.yaml`.
 * Renders a list of LLM providers; each provider contains one or more models.
 * Fires `onChange` with partial updates on every field change.
 */
export function DaemonConfigPanel({ value, onChange, className }: DaemonConfigPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const providers = value.llm?.providers?.length ? value.llm.providers : [emptyProvider()];

  const updateLlm = (partial: Partial<DaemonConfig['llm']>) => {
    onChange({ llm: { ...value.llm, ...partial } });
  };

  const updateProviders = (next: LlmProviderEntry[]) => {
    updateLlm({ providers: next });
  };

  const updateProvider = (index: number, partial: Partial<LlmProviderEntry>) => {
    const next = providers.map((p, i) => (i === index ? { ...p, ...partial } : p));
    updateProviders(next);
  };

  const updateModel = (
    providerIndex: number,
    modelIndex: number,
    partial: Partial<DaemonConfig['llm']['providers'][number]['models'][number]>
  ) => {
    const next = providers.map((p, i) => {
      if (i !== providerIndex) return p;
      const models = p.models.map((m, j) => (j === modelIndex ? { ...m, ...partial } : m));
      return { ...p, models };
    });
    updateProviders(next);
  };

  const addProvider = () => {
    updateProviders([...providers, emptyProvider()]);
  };

  const removeProvider = (index: number) => {
    const next = providers.filter((_, i) => i !== index);
    updateProviders(next.length ? next : [emptyProvider()]);
  };

  const addModel = (providerIndex: number) => {
    const next = providers.map((p, i) =>
      i === providerIndex ? { ...p, models: [...p.models, { modelId: '' }] } : p
    );
    updateProviders(next);
  };

  const removeModel = (providerIndex: number, modelIndex: number) => {
    const next = providers.map((p, i) => {
      if (i !== providerIndex) return p;
      const models = p.models.filter((_, j) => j !== modelIndex);
      return { ...p, models: models.length ? models : [{ modelId: '' }] };
    });
    updateProviders(next);
  };

  return (
    <div className={className}>
      <div
        css={css`
          font-weight: 500;
          margin-bottom: ${theme.spacing[4]};
          color: ${theme.color.text};
        `}
      >
        {t('daemon.llm.title')}
      </div>
      {providers.map((provider, providerIndex) => (
        <Card
          key={providerIndex}
          size="small"
          title={t('daemon.llm.providerTitle', { index: providerIndex + 1 })}
          extra={
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 size={14} />}
              onClick={() => removeProvider(providerIndex)}
              data-testid={`daemon-llm-remove-provider-${providerIndex}`}
            >
              {t('daemon.llm.removeProvider')}
            </Button>
          }
          css={css`
            margin-bottom: ${theme.spacing[4]};
          `}
        >
          <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label={t('daemon.llm.providerName')} required>
              <Input
                value={provider.name}
                onChange={(e) => updateProvider(providerIndex, { name: e.target.value })}
                placeholder="openai"
                data-testid={`daemon-llm-provider-${providerIndex}-name`}
              />
            </Form.Item>

            <Form.Item label={t('daemon.llm.apiKey')} required>
              <Input.Password
                value={provider.apiKey}
                onChange={(e) => updateProvider(providerIndex, { apiKey: e.target.value })}
                placeholder="sk-..."
                data-testid={`daemon-llm-provider-${providerIndex}-apiKey`}
              />
            </Form.Item>

            <Form.Item label={t('daemon.llm.baseUrl')}>
              <Input
                value={provider.baseUrl ?? ''}
                onChange={(e) =>
                  updateProvider(providerIndex, {
                    baseUrl: e.target.value.length ? e.target.value : undefined,
                  })
                }
                placeholder="https://api.openai.com/v1"
                data-testid={`daemon-llm-provider-${providerIndex}-baseUrl`}
              />
            </Form.Item>

            <Form.Item label={t('daemon.llm.maxConcurrency')}>
              <InputNumber
                value={provider.maxConcurrency ?? undefined}
                onChange={(v) => updateProvider(providerIndex, { maxConcurrency: v ?? null })}
                placeholder="Auto"
                style={{ width: '100%' }}
                data-testid={`daemon-llm-provider-${providerIndex}-maxConcurrency`}
              />
            </Form.Item>
          </Form>

          <div
            css={css`
              margin-top: ${theme.spacing[3]};
              padding-top: ${theme.spacing[3]};
              border-top: 1px solid ${theme.color.border};
            `}
          >
            <div
              css={css`
                font-weight: 500;
                margin-bottom: ${theme.spacing[3]};
                color: ${theme.color.textSecondary};
              `}
            >
              {t('daemon.llm.modelsTitle')}
            </div>

            {provider.models.map((model, modelIndex) => (
              <Card
                key={modelIndex}
                size="small"
                type="inner"
                css={css`
                  margin-bottom: ${theme.spacing[3]};
                `}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 size={14} />}
                    onClick={() => removeModel(providerIndex, modelIndex)}
                    data-testid={`daemon-llm-provider-${providerIndex}-remove-model-${modelIndex}`}
                  >
                    {t('daemon.llm.removeModel')}
                  </Button>
                }
              >
                <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Form.Item label={t('daemon.llm.modelId')} required>
                    <Input
                      value={model.modelId}
                      onChange={(e) =>
                        updateModel(providerIndex, modelIndex, { modelId: e.target.value })
                      }
                      placeholder="gpt-4o"
                      data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-modelId`}
                    />
                  </Form.Item>

                  <Form.Item label={t('daemon.llm.contextWindow')}>
                    <InputNumber
                      value={model.contextWindow ?? undefined}
                      onChange={(v) =>
                        updateModel(providerIndex, modelIndex, { contextWindow: v ?? null })
                      }
                      placeholder="Auto"
                      style={{ width: '100%' }}
                      data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-contextWindow`}
                    />
                  </Form.Item>

                  <Form.Item label={t('daemon.llm.maxTokens')}>
                    <InputNumber
                      value={model.maxTokens ?? undefined}
                      onChange={(v) =>
                        updateModel(providerIndex, modelIndex, { maxTokens: v ?? null })
                      }
                      placeholder="Auto"
                      style={{ width: '100%' }}
                      data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-maxTokens`}
                    />
                  </Form.Item>

                  <Form.Item label={t('daemon.llm.reasoning')}>
                    <Select
                      value={String(model.reasoning ?? 'auto')}
                      onChange={(v) => {
                        const resolved = v === 'auto' ? null : v === 'true';
                        updateModel(providerIndex, modelIndex, { reasoning: resolved });
                      }}
                      options={REASONING_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: t(opt.labelKey),
                      }))}
                      data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-reasoning`}
                    />
                  </Form.Item>
                </Form>
              </Card>
            ))}

            <Button
              type="dashed"
              size="small"
              icon={<Plus size={14} />}
              onClick={() => addModel(providerIndex)}
              data-testid={`daemon-llm-provider-${providerIndex}-add-model`}
            >
              {t('daemon.llm.addModel')}
            </Button>
          </div>
        </Card>
      ))}

      <Button
        type="dashed"
        icon={<Plus size={14} />}
        onClick={addProvider}
        data-testid="daemon-llm-add-provider"
      >
        {t('daemon.llm.addProvider')}
      </Button>
    </div>
  );
}
