/**
 * Human interaction block
 */
import { useState } from 'react';
import { css } from '@emotion/react';
import { SendHorizontal } from 'lucide-react';
import { Button, Input, Radio, Checkbox, Form } from 'antd';
import type { BlockProps, HumanInputMetadata } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { BlockCard } from './BlockCard.js';

/** Format human input response for display */
function formatResponse(response: unknown): string {
  if (response === true) return '已确认';
  if (response === false) return '已取消';
  if (typeof response === 'string') return response;
  if (Array.isArray(response)) return response.join(', ');
  if (typeof response === 'number') return String(response);
  if (response === null || response === undefined) return '';
  return String(response);
}

/** Display submitted response in completed state */
function ResponseDisplay({ response }: { response: unknown }) {
  const theme = useTheme();
  const text = formatResponse(response);

  if (!text) {
    return (
      <div
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.textTertiary};
        `}
      >
        已完成
      </div>
    );
  }

  return (
    <div
      css={css`
        font-size: ${theme.font.size.sm};
        color: ${theme.color.textSecondary};
      `}
    >
      <span
        css={css`
          color: ${theme.color.textTertiary};
          margin-right: ${theme.spacing[1]};
        `}
      >
        →
      </span>
      {text}
    </div>
  );
}

export function HumanInputBlock({ block, onConfirm }: BlockProps) {
  const theme = useTheme();
  const meta = block.metadata as HumanInputMetadata | undefined;
  const [inputValue, setInputValue] = useState(meta?.defaultValue ?? '');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    meta?.defaultValue ? [meta.defaultValue] : []
  );

  const inputType = meta?.inputType ?? 'confirmation';
  const requestId = meta?.requestId ?? block.id;
  const isPending = block.status === 'pending' || block.status === 'streaming';

  const handleSubmit = (response: unknown) => {
    onConfirm?.(requestId, response);
  };

  return (
    <BlockCard
      icon={<SendHorizontal size={14} />}
      title={meta?.title ?? '需要确认'}
      accentColor={theme.blockColor.humanInput.text}
      tag={isPending ? '等待中' : '已回复'}
    >
      {meta?.message && (
        <div
          css={css`
            font-size: ${theme.font.size.sm};
            color: ${theme.color.textSecondary};
            margin-bottom: ${theme.spacing[3]};
          `}
        >
          {meta.message}
        </div>
      )}

      {!isPending ? (
        <ResponseDisplay response={meta?.response} />
      ) : (
        <Form layout="vertical" size="small">
          {inputType === 'confirmation' && (
            <div
              css={css`
                display: flex;
                justify-content: flex-end;
                gap: ${theme.spacing[2]};
              `}
            >
              <Button type="text" size="small" onClick={() => handleSubmit(false)}>
                取消
              </Button>
              <Button type="default" size="small" onClick={() => handleSubmit(true)}>
                确认
              </Button>
            </div>
          )}

          {inputType === 'input' && (
            <div
              css={css`
                display: flex;
                gap: ${theme.spacing[2]};
              `}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入..."
                size="small"
                style={{ flex: 1 }}
              />
              <Button type="default" size="small" onClick={() => handleSubmit(inputValue)}>
                提交
              </Button>
            </div>
          )}

          {inputType === 'single-select' && meta?.options && (
            <>
              <Radio.Group
                value={selectedValues[0]}
                onChange={(e) => setSelectedValues([e.target.value])}
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: ${theme.spacing[2]};
                  margin-bottom: ${theme.spacing[3]};
                `}
              >
                {meta.options.map((opt) => (
                  <Radio key={opt.value} value={opt.value}>
                    {opt.label}
                  </Radio>
                ))}
              </Radio.Group>
              <div
                css={css`
                  display: flex;
                  justify-content: flex-end;
                `}
              >
                <Button
                  type="default"
                  size="small"
                  disabled={selectedValues.length === 0}
                  onClick={() => handleSubmit(selectedValues[0])}
                >
                  提交
                </Button>
              </div>
            </>
          )}

          {inputType === 'multi-select' && meta?.options && (
            <>
              <Checkbox.Group
                value={selectedValues}
                onChange={(vals) => setSelectedValues(vals as string[])}
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: ${theme.spacing[2]};
                  margin-bottom: ${theme.spacing[3]};
                `}
              >
                {meta.options.map((opt) => (
                  <Checkbox key={opt.value} value={opt.value}>
                    {opt.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
              <div
                css={css`
                  display: flex;
                  justify-content: flex-end;
                `}
              >
                <Button
                  type="default"
                  size="small"
                  disabled={selectedValues.length === 0}
                  onClick={() => handleSubmit(selectedValues)}
                >
                  提交
                </Button>
              </div>
            </>
          )}
        </Form>
      )}
    </BlockCard>
  );
}
