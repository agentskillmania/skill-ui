/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Compact daemon configuration panel for LLM connections.
 *
 * @module
 */

import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Input, InputNumber, Select } from 'antd';
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
 * Compact controlled form for editing LLM connections.
 *
 * @remarks
 * Presents each provider as a "connection" card. Internal terminology still
 * maps to `providers`/`models`, but the UI shows friendlier labels like
 * "Connection" and hides implementation jargon.
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
          margin-bottom: ${theme.spacing[3]};
          color: ${theme.color.text};
        `}
      >
        {t('daemon.llm.title')}
      </div>

      {providers.map((provider, providerIndex) => (
        <Card
          key={providerIndex}
          size="small"
          title={
            <span>
              {t('daemon.llm.providerTitle', { index: providerIndex + 1 })}
              {provider.name && (
                <span
                  css={css`
                    margin-left: ${theme.spacing[2]};
                    color: ${theme.color.textSecondary};
                    font-weight: 400;
                  `}
                >
                  · {provider.name}
                </span>
              )}
            </span>
          }
          extra={
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 size={14} />}
              onClick={() => removeProvider(providerIndex)}
              data-testid={`daemon-llm-remove-provider-${providerIndex}`}
            />
          }
          css={css`
            margin-bottom: ${theme.spacing[3]};
            .ant-card-body {
              padding: ${theme.spacing[3]};
            }
          `}
        >
          <div
            css={css`
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: ${theme.spacing[3]};
              margin-bottom: ${theme.spacing[3]};
              @media (max-width: 600px) {
                grid-template-columns: 1fr;
              }
            `}
          >
            <div>
              <label
                css={css`
                  display: block;
                  margin-bottom: ${theme.spacing[1]};
                  font-size: 12px;
                  color: ${theme.color.textSecondary};
                `}
              >
                {t('daemon.llm.providerName')}
              </label>
              <Input
                value={provider.name}
                onChange={(e) => updateProvider(providerIndex, { name: e.target.value })}
                placeholder="openai"
                size="small"
                data-testid={`daemon-llm-provider-${providerIndex}-name`}
              />
            </div>

            <div>
              <label
                css={css`
                  display: block;
                  margin-bottom: ${theme.spacing[1]};
                  font-size: 12px;
                  color: ${theme.color.textSecondary};
                `}
              >
                {t('daemon.llm.apiKey')}
              </label>
              <Input.Password
                value={provider.apiKey}
                onChange={(e) => updateProvider(providerIndex, { apiKey: e.target.value })}
                placeholder="sk-..."
                size="small"
                data-testid={`daemon-llm-provider-${providerIndex}-apiKey`}
              />
            </div>

            <div>
              <label
                css={css`
                  display: block;
                  margin-bottom: ${theme.spacing[1]};
                  font-size: 12px;
                  color: ${theme.color.textSecondary};
                `}
              >
                {t('daemon.llm.baseUrl')}
              </label>
              <Input
                value={provider.baseUrl ?? ''}
                onChange={(e) =>
                  updateProvider(providerIndex, {
                    baseUrl: e.target.value.length ? e.target.value : undefined,
                  })
                }
                placeholder="https://api.openai.com/v1"
                size="small"
                data-testid={`daemon-llm-provider-${providerIndex}-baseUrl`}
              />
            </div>

            <div>
              <label
                css={css`
                  display: block;
                  margin-bottom: ${theme.spacing[1]};
                  font-size: 12px;
                  color: ${theme.color.textSecondary};
                `}
              >
                {t('daemon.llm.maxConcurrency')}
              </label>
              <InputNumber
                value={provider.maxConcurrency ?? undefined}
                onChange={(v) => updateProvider(providerIndex, { maxConcurrency: v ?? null })}
                placeholder="Auto"
                size="small"
                style={{ width: '100%' }}
                data-testid={`daemon-llm-provider-${providerIndex}-maxConcurrency`}
              />
            </div>
          </div>

          <div
            css={css`
              margin-top: ${theme.spacing[2]};
              padding-top: ${theme.spacing[2]};
              border-top: 1px solid ${theme.color.border};
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: ${theme.spacing[2]};
                font-size: 12px;
                color: ${theme.color.textSecondary};
              `}
            >
              <span>{t('daemon.llm.modelsTitle')}</span>
              <Button
                type="dashed"
                size="small"
                icon={<Plus size={12} />}
                onClick={() => addModel(providerIndex)}
                data-testid={`daemon-llm-provider-${providerIndex}-add-model`}
              >
                {t('daemon.llm.addModel')}
              </Button>
            </div>

            {provider.models.map((model, modelIndex) => (
              <div
                key={modelIndex}
                css={css`
                  display: flex;
                  align-items: flex-end;
                  gap: ${theme.spacing[2]};
                  margin-bottom: ${theme.spacing[2]};
                `}
              >
                <div
                  css={css`
                    flex: 2;
                    min-width: 0;
                  `}
                >
                  <label
                    css={css`
                      display: block;
                      margin-bottom: ${theme.spacing[1]};
                      font-size: 12px;
                      color: ${theme.color.textSecondary};
                    `}
                  >
                    {t('daemon.llm.modelId')}
                  </label>
                  <Input
                    value={model.modelId}
                    onChange={(e) =>
                      updateModel(providerIndex, modelIndex, { modelId: e.target.value })
                    }
                    placeholder="gpt-4o"
                    size="small"
                    data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-modelId`}
                  />
                </div>

                <div
                  css={css`
                    flex: 1;
                    min-width: 0;
                  `}
                >
                  <label
                    css={css`
                      display: block;
                      margin-bottom: ${theme.spacing[1]};
                      font-size: 12px;
                      color: ${theme.color.textSecondary};
                    `}
                  >
                    {t('daemon.llm.contextWindow')}
                  </label>
                  <InputNumber
                    value={model.contextWindow ?? undefined}
                    onChange={(v) =>
                      updateModel(providerIndex, modelIndex, { contextWindow: v ?? null })
                    }
                    placeholder="Auto"
                    size="small"
                    style={{ width: '100%' }}
                    data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-contextWindow`}
                  />
                </div>

                <div
                  css={css`
                    flex: 1;
                    min-width: 0;
                  `}
                >
                  <label
                    css={css`
                      display: block;
                      margin-bottom: ${theme.spacing[1]};
                      font-size: 12px;
                      color: ${theme.color.textSecondary};
                    `}
                  >
                    {t('daemon.llm.maxTokens')}
                  </label>
                  <InputNumber
                    value={model.maxTokens ?? undefined}
                    onChange={(v) =>
                      updateModel(providerIndex, modelIndex, { maxTokens: v ?? null })
                    }
                    placeholder="Auto"
                    size="small"
                    style={{ width: '100%' }}
                    data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-maxTokens`}
                  />
                </div>

                <div
                  css={css`
                    flex: 1;
                    min-width: 0;
                  `}
                >
                  <label
                    css={css`
                      display: block;
                      margin-bottom: ${theme.spacing[1]};
                      font-size: 12px;
                      color: ${theme.color.textSecondary};
                    `}
                  >
                    {t('daemon.llm.reasoning')}
                  </label>
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
                    size="small"
                    style={{ width: '100%' }}
                    data-testid={`daemon-llm-provider-${providerIndex}-model-${modelIndex}-reasoning`}
                  />
                </div>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 size={14} />}
                  onClick={() => removeModel(providerIndex, modelIndex)}
                  css={css`
                    margin-bottom: 1px;
                  `}
                  data-testid={`daemon-llm-provider-${providerIndex}-remove-model-${modelIndex}`}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Button
        type="dashed"
        size="small"
        icon={<Plus size={14} />}
        onClick={addProvider}
        data-testid="daemon-llm-add-provider"
      >
        {t('daemon.llm.addProvider')}
      </Button>
    </div>
  );
}
