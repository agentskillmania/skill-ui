/** @jsxImportSource @emotion/react */
/**
 * @fileoverview Compact daemon configuration panel for LLM connections.
 *
 * @module
 */

import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Form, Input, InputNumber, Select } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { DaemonConfigPanelProps, LlmQuickInit } from '../types.js';

interface LlmModelEntryForm {
  modelId: string;
  contextWindow?: number | null;
  maxTokens?: number | null;
  reasoning: string;
}

interface LlmProviderEntryForm {
  name: string;
  apiKey: string;
  baseUrl?: string;
  maxConcurrency?: number | null;
  models: LlmModelEntryForm[];
}

interface LlmQuickInitForm {
  providers: LlmProviderEntryForm[];
}

const REASONING_OPTIONS = [
  { value: 'auto', labelKey: 'reasoning.auto' },
  { value: 'true', labelKey: 'reasoning.enabled' },
  { value: 'false', labelKey: 'reasoning.disabled' },
] as const;

const emptyProvider = (): LlmProviderEntryForm => ({
  name: '',
  apiKey: '',
  models: [{ modelId: '', reasoning: 'auto' }],
});

function normalizeReasoningToForm(reasoning?: boolean | null): string {
  if (reasoning === true) return 'true';
  if (reasoning === false) return 'false';
  return 'auto';
}

function normalizeReasoningFromForm(value: string): boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function normalizeLlmForForm(llm: LlmQuickInit | undefined): LlmQuickInitForm {
  if (!llm?.providers?.length) {
    return { providers: [emptyProvider()] };
  }

  return {
    providers: llm.providers.map((p) => ({
      ...p,
      maxConcurrency: p.maxConcurrency ?? null,
      models: p.models.map((m) => ({
        ...m,
        contextWindow: m.contextWindow ?? null,
        maxTokens: m.maxTokens ?? null,
        reasoning: normalizeReasoningToForm(m.reasoning),
      })),
    })),
  };
}

function normalizeLlmFromForm(llm: LlmQuickInitForm): LlmQuickInit {
  return {
    providers: llm.providers
      .filter((p): p is LlmProviderEntryForm => Boolean(p))
      .map((p) => ({
        name: p.name ?? '',
        apiKey: p.apiKey ?? '',
        baseUrl: p.baseUrl?.length ? p.baseUrl : undefined,
        maxConcurrency: p.maxConcurrency ?? null,
        models: (p.models ?? []).map((m) => ({
          modelId: m?.modelId ?? '',
          contextWindow: m?.contextWindow ?? null,
          maxTokens: m?.maxTokens ?? null,
          reasoning: normalizeReasoningFromForm(m?.reasoning as unknown as string),
        })),
      })),
  };
}

/**
 * Compact controlled form for editing LLM connections.
 *
 * @remarks
 * Uses antd Form and Form.List to manage nested providers/models. The UI
 * presents each provider as a "connection"; internal naming still maps to the
 * colts/wrangler provider model.
 */
export function DaemonConfigPanel({ value, onChange, className }: DaemonConfigPanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [form] = Form.useForm<LlmQuickInitForm>();

  useEffect(() => {
    form.setFieldsValue(normalizeLlmForForm(value.llm));
  }, [value.llm, form]);

  const handleValuesChange = (_changed: unknown, all: LlmQuickInitForm) => {
    onChange({ llm: normalizeLlmFromForm(all) });
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

      <Form
        form={form}
        onValuesChange={handleValuesChange}
        component={false}
        layout="horizontal"
        labelAlign="right"
        labelCol={{ flex: '96px' }}
        wrapperCol={{ flex: 'auto' }}
        colon={false}
      >
        <Form.List name="providers">
          {(providerFields, { add: addProvider, remove: removeProvider }) => (
            <>
              {providerFields.map((providerField) => (
                <Form.Item noStyle key={providerField.key} shouldUpdate>
                  {({ getFieldValue }) => {
                    const providerName: string =
                      getFieldValue(['providers', providerField.name, 'name']) ?? '';
                    return (
                      <Card
                        size="small"
                        title={
                          <span>
                            {t('daemon.llm.providerTitle', { index: providerField.name + 1 })}
                            {providerName && (
                              <span
                                css={css`
                                  margin-left: ${theme.spacing[2]};
                                  color: ${theme.color.textSecondary};
                                  font-weight: 400;
                                `}
                              >
                                · {providerName}
                              </span>
                            )}
                          </span>
                        }
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 size={14} />}
                            onClick={() => removeProvider(providerField.name)}
                            data-testid={`daemon-llm-remove-provider-${providerField.name}`}
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
                            gap: ${theme.spacing[3]} ${theme.spacing[4]};
                            @media (max-width: 600px) {
                              grid-template-columns: 1fr;
                            }
                          `}
                        >
                          <Form.Item
                            name={[providerField.name, 'name']}
                            label={t('daemon.llm.providerName')}
                            rules={[{ required: true, message: t('daemon.llm.providerName') }]}
                          >
                            <Input
                              placeholder="openai"
                              data-testid={`daemon-llm-provider-${providerField.name}-name`}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[providerField.name, 'apiKey']}
                            label={t('daemon.llm.apiKey')}
                            rules={[{ required: true, message: t('daemon.llm.apiKey') }]}
                          >
                            <Input.Password
                              placeholder="sk-..."
                              data-testid={`daemon-llm-provider-${providerField.name}-apiKey`}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[providerField.name, 'baseUrl']}
                            label={t('daemon.llm.baseUrl')}
                          >
                            <Input
                              placeholder="https://api.openai.com/v1"
                              data-testid={`daemon-llm-provider-${providerField.name}-baseUrl`}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[providerField.name, 'maxConcurrency']}
                            label={t('daemon.llm.maxConcurrency')}
                          >
                            <InputNumber
                              placeholder="Auto"
                              style={{ width: '100%' }}
                              data-testid={`daemon-llm-provider-${providerField.name}-maxConcurrency`}
                            />
                          </Form.Item>
                        </div>

                        <div
                          css={css`
                            margin-top: ${theme.spacing[2]};
                            padding-top: ${theme.spacing[2]};
                            border-top: 1px solid ${theme.color.border};
                          `}
                        >
                          <Form.List name={[providerField.name, 'models']}>
                            {(modelFields, { add: addModel, remove: removeModel }) => (
                              <>
                                <div
                                  css={css`
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    margin-bottom: ${theme.spacing[2]};
                                    color: ${theme.color.textSecondary};
                                  `}
                                >
                                  <span>{t('daemon.llm.modelsTitle')}</span>
                                  <Button
                                    type="dashed"
                                    icon={<Plus size={14} />}
                                    onClick={() => addModel({ modelId: '', reasoning: 'auto' })}
                                    data-testid={`daemon-llm-provider-${providerField.name}-add-model`}
                                  >
                                    {t('daemon.llm.addModel')}
                                  </Button>
                                </div>

                                {modelFields.map((modelField) => (
                                  <div
                                    key={modelField.key}
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
                                      <Form.Item
                                        name={[modelField.name, 'modelId']}
                                        label={t('daemon.llm.modelId')}
                                        labelCol={{ flex: '72px' }}
                                        wrapperCol={{ flex: 'auto' }}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Input
                                          placeholder="gpt-4o"
                                          data-testid={`daemon-llm-provider-${providerField.name}-model-${modelField.name}-modelId`}
                                        />
                                      </Form.Item>
                                    </div>

                                    <div
                                      css={css`
                                        flex: 1;
                                        min-width: 0;
                                      `}
                                    >
                                      <Form.Item
                                        name={[modelField.name, 'contextWindow']}
                                        label={t('daemon.llm.contextWindow')}
                                        labelCol={{ flex: '72px' }}
                                        wrapperCol={{ flex: 'auto' }}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <InputNumber
                                          placeholder="Auto"
                                          style={{ width: '100%' }}
                                          data-testid={`daemon-llm-provider-${providerField.name}-model-${modelField.name}-contextWindow`}
                                        />
                                      </Form.Item>
                                    </div>

                                    <div
                                      css={css`
                                        flex: 1;
                                        min-width: 0;
                                      `}
                                    >
                                      <Form.Item
                                        name={[modelField.name, 'maxTokens']}
                                        label={t('daemon.llm.maxTokens')}
                                        labelCol={{ flex: '72px' }}
                                        wrapperCol={{ flex: 'auto' }}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <InputNumber
                                          placeholder="Auto"
                                          style={{ width: '100%' }}
                                          data-testid={`daemon-llm-provider-${providerField.name}-model-${modelField.name}-maxTokens`}
                                        />
                                      </Form.Item>
                                    </div>

                                    <div
                                      css={css`
                                        flex: 1;
                                        min-width: 0;
                                      `}
                                    >
                                      <Form.Item
                                        name={[modelField.name, 'reasoning']}
                                        label={t('daemon.llm.reasoning')}
                                        labelCol={{ flex: '72px' }}
                                        wrapperCol={{ flex: 'auto' }}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Select
                                          options={REASONING_OPTIONS.map((opt) => ({
                                            value: opt.value,
                                            label: t(opt.labelKey),
                                          }))}
                                          style={{ width: '100%' }}
                                          data-testid={`daemon-llm-provider-${providerField.name}-model-${modelField.name}-reasoning`}
                                        />
                                      </Form.Item>
                                    </div>

                                    <Button
                                      type="text"
                                      danger
                                      icon={<Trash2 size={14} />}
                                      onClick={() => removeModel(modelField.name)}
                                      css={css`
                                        margin-bottom: 1px;
                                      `}
                                      data-testid={`daemon-llm-provider-${providerField.name}-remove-model-${modelField.name}`}
                                    />
                                  </div>
                                ))}
                              </>
                            )}
                          </Form.List>
                        </div>
                      </Card>
                    );
                  }}
                </Form.Item>
              ))}

              <Button
                type="dashed"
                icon={<Plus size={14} />}
                onClick={() => addProvider(emptyProvider())}
                data-testid="daemon-llm-add-provider"
              >
                {t('daemon.llm.addProvider')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
}
