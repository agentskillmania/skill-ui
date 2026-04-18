/**
 * 人机交互块
 */
import { useState } from 'react';
import { css } from '@emotion/react';
import { SendHorizontal } from 'lucide-react';
import { Button, Input, Radio, Checkbox, Form } from 'antd';
import type { BlockProps, HumanInputMetadata } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { BlockCard } from './BlockCard.js';

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
        <div
          css={css`
            font-size: ${theme.font.size.sm};
            color: ${theme.color.textTertiary};
          `}
        >
          已完成
        </div>
      ) : (
        <Form layout="vertical" size="small">
          {inputType === 'confirmation' && (
            <div
              css={css`
                display: flex;
                gap: ${theme.spacing[2]};
              `}
            >
              <Button type="primary" size="small" onClick={() => handleSubmit(true)}>
                确认
              </Button>
              <Button size="small" onClick={() => handleSubmit(false)}>
                取消
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
                style={{ flex: 1 }}
              />
              <Button type="primary" size="small" onClick={() => handleSubmit(inputValue)}>
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
              <Button
                type="primary"
                size="small"
                disabled={selectedValues.length === 0}
                onClick={() => handleSubmit(selectedValues[0])}
              >
                提交
              </Button>
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
              <Button
                type="primary"
                size="small"
                disabled={selectedValues.length === 0}
                onClick={() => handleSubmit(selectedValues)}
              >
                提交
              </Button>
            </>
          )}
        </Form>
      )}
    </BlockCard>
  );
}
