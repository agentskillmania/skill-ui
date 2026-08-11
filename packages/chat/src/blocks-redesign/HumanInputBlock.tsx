/**
 * Human interaction block — dialog/form style
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { User, Check, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, HumanInputMetadata } from '../types.js';

/**
 * Shared button base — layout, typography, transition, and active-state
 * feedback. Common to every action button in this block.
 */
const buttonBaseCss = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.radius.md};
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.semibold};
  cursor: pointer;
  transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
  &:active {
    transform: scale(0.97);
  }
`;

/**
 * Solid (default) button variant — bordered container background with a
 * hover that lifts fill and border color.
 */
const solidButtonCss = (theme: Theme) => css`
  border: 1px solid ${theme.color.border};
  background: ${theme.color.bgContainer};
  color: ${theme.color.text};
  &:hover {
    background: ${theme.color.fill};
    border-color: ${theme.color.borderHover};
  }
`;

/**
 * Disabled-state rules appended to submit-style buttons that can be disabled
 * when no selection has been made.
 */
const disabledButtonCss = css`
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/** Format human input response for display */
function formatResponse(response: unknown, t: (key: string) => string): string {
  if (response === true) return t('humanInput.confirmed');
  if (response === false) return t('humanInput.cancelled');
  if (typeof response === 'string') return response;
  if (typeof response === 'number') return String(response);
  if (response === null || response === undefined) return '';
  // The daemon serializes HumanResponse as a tagged enum, e.g.
  // { "Question": { "answers": ... } } or { "ToolConfirm": { "approved": ... } }.
  // Unwrap one level so we display the inner value, not "[object Object]".
  if (typeof response === 'object' && !Array.isArray(response)) {
    const obj = response as Record<string, unknown>;
    const tag = Object.keys(obj)[0];
    if (tag && typeof obj[tag] === 'object' && obj[tag] !== null) {
      return formatResponse(obj[tag], t);
    }
    const answers = (obj as { answers?: unknown }).answers;
    if (answers !== undefined) return formatResponse(answers, t);
    return JSON.stringify(obj);
  }
  if (Array.isArray(response)) return response.join(', ');
  return String(response);
}

export function HumanInputBlock({ block, onConfirm }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as HumanInputMetadata | undefined;
  const [inputValue, setInputValue] = useState(meta?.defaultValue ?? '');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    meta?.defaultValue ? [meta.defaultValue] : []
  );

  const inputType = meta?.inputType ?? 'confirmation';
  const requestId = meta?.requestId ?? block.id;
  const isPending = block.status === 'pending' || block.status === 'streaming';
  const accentColor = theme.blockColor.humanInput.text;
  const accentBg = theme.blockColor.humanInput.bg;

  const handleSubmit = (response: unknown) => {
    onConfirm?.(requestId, response);
  };

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        overflow: hidden;
        transition:
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
          box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          border-color: ${theme.color.borderHover};
          box-shadow: ${theme.shadow.sm};
        }
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[3]};
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          background: ${accentBg};
          border-bottom: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: ${theme.radius.md};
            background: ${accentBg};
            color: ${accentColor};
            border: 1px solid ${theme.color.border};
            flex-shrink: 0;
          `}
        >
          <User size={16} />
        </div>
        <div
          css={css`
            flex: 1;
            min-width: 0;
          `}
        >
          <div
            css={css`
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {meta?.title ?? t('humanInput.needConfirm')}
          </div>
          {meta?.message && !isPending && (
            <div
              css={css`
                font-size: ${theme.font.size.sm};
                color: ${theme.color.textTertiary};
                margin-top: 1px;
              `}
            >
              {meta.message}
            </div>
          )}
        </div>
        <span
          css={css`
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            padding: 3px 10px;
            border-radius: ${theme.radius.full};
            background: ${isPending ? accentBg : theme.color.successBg};
            color: ${isPending ? accentColor : theme.color.success};
            border: 1px solid ${isPending ? theme.color.border : theme.color.success};
            flex-shrink: 0;
          `}
        >
          {isPending ? t('humanInput.pending') : t('humanInput.replied')}
        </span>
      </div>

      {/* Body */}
      {!isPending ? (
        /* Completed state */
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[3]} ${theme.spacing[4]};
            background: ${accentBg};
            border-top: 1px solid ${theme.color.borderSecondary};
            font-size: ${theme.font.size.base};
            color: ${accentColor};
            font-weight: ${theme.font.weight.medium};
          `}
        >
          <Check size={14} style={{ opacity: 0.6 }} />
          {formatResponse(meta?.response, t) || t('humanInput.completed')}
        </div>
      ) : (
        /* Pending state */
        <div
          css={css`
            padding: ${theme.spacing[4]};
          `}
        >
          {meta?.message && (
            <div
              css={css`
                font-size: ${theme.font.size.base};
                line-height: ${theme.font.lineHeightRelaxed};
                color: ${theme.color.textSecondary};
                margin-bottom: ${theme.spacing[4]};
              `}
            >
              {meta.message}
            </div>
          )}

          {/* Confirmation */}
          {inputType === 'confirmation' && (
            <div
              css={css`
                display: flex;
                justify-content: flex-end;
                gap: ${theme.spacing[2]};
              `}
            >
              <button
                css={[
                  buttonBaseCss(theme),
                  css`
                    border: 1px solid transparent;
                    background: transparent;
                    color: ${theme.color.textSecondary};
                    &:hover {
                      background: ${theme.color.fillSubtle};
                      color: ${theme.color.text};
                    }
                  `,
                ]}
                onClick={() => handleSubmit(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                css={[buttonBaseCss(theme), solidButtonCss(theme)]}
                onClick={() => handleSubmit(true)}
              >
                <Check size={14} />
                {t('common.confirm')}
              </button>
            </div>
          )}

          {/* Text input */}
          {inputType === 'input' && (
            <div
              css={css`
                display: flex;
                gap: ${theme.spacing[2]};
              `}
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('humanInput.placeholder')}
                css={css`
                  flex: 1;
                  padding: ${theme.spacing[2]} ${theme.spacing[3]};
                  border-radius: ${theme.radius.md};
                  border: 1px solid ${theme.color.border};
                  background: ${theme.color.bgContainer};
                  color: ${theme.color.text};
                  font-family: ${theme.font.family};
                  font-size: ${theme.font.size.base};
                  outline: none;
                  transition:
                    border-color ${theme.motion.duration.fast} ${theme.motion.easing.out},
                    box-shadow ${theme.motion.duration.fast} ${theme.motion.easing.out};
                  &::placeholder {
                    color: ${theme.color.textQuaternary};
                  }
                  &:focus {
                    border-color: ${theme.color.primary};
                    box-shadow: 0 0 0 3px ${theme.color.primaryBg};
                  }
                `}
              />
              <button
                css={[buttonBaseCss(theme), solidButtonCss(theme)]}
                onClick={() => handleSubmit(inputValue)}
              >
                <SendHorizontal size={14} />
                {t('common.submit')}
              </button>
            </div>
          )}

          {/* Single select */}
          {inputType === 'single-select' && meta?.options && (
            <>
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: ${theme.spacing[2]};
                `}
              >
                {meta.options.map((opt) => {
                  const isSelected = selectedValues[0] === opt.value;
                  return (
                    <div
                      key={opt.value}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: ${theme.spacing[3]};
                        padding: ${theme.spacing[2]} ${theme.spacing[3]};
                        border-radius: ${theme.radius.md};
                        border: 1px solid ${isSelected ? theme.color.primary : theme.color.border};
                        background: ${isSelected ? theme.color.primaryBg : theme.color.bgContainer};
                        cursor: pointer;
                        transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
                        &:hover {
                          border-color: ${theme.color.primary};
                          background: ${isSelected
                            ? theme.color.primaryBg
                            : theme.color.fillSubtle};
                        }
                      `}
                      onClick={() => setSelectedValues([opt.value])}
                    >
                      <span
                        css={css`
                          width: 18px;
                          height: 18px;
                          border-radius: ${theme.radius.full};
                          border: 2px solid ${isSelected ? theme.color.primary : theme.color.border};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
                        `}
                      >
                        {isSelected && (
                          <span
                            css={css`
                              width: 8px;
                              height: 8px;
                              border-radius: ${theme.radius.full};
                              background: ${theme.color.primary};
                            `}
                          />
                        )}
                      </span>
                      <span
                        css={css`
                          font-size: ${theme.font.size.base};
                          color: ${theme.color.text};
                        `}
                      >
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                css={css`
                  display: flex;
                  justify-content: flex-end;
                  margin-top: ${theme.spacing[4]};
                `}
              >
                <button
                  css={[buttonBaseCss(theme), solidButtonCss(theme), disabledButtonCss]}
                  disabled={selectedValues.length === 0}
                  onClick={() => handleSubmit(selectedValues[0])}
                >
                  {t('common.submit')}
                </button>
              </div>
            </>
          )}

          {/* Multi select */}
          {inputType === 'multi-select' && meta?.options && (
            <>
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: ${theme.spacing[2]};
                `}
              >
                {meta.options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: ${theme.spacing[3]};
                        padding: ${theme.spacing[2]} ${theme.spacing[3]};
                        border-radius: ${theme.radius.md};
                        border: 1px solid ${isSelected ? theme.color.primary : theme.color.border};
                        background: ${isSelected ? theme.color.primaryBg : theme.color.bgContainer};
                        cursor: pointer;
                        transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
                        &:hover {
                          border-color: ${theme.color.primary};
                          background: ${isSelected
                            ? theme.color.primaryBg
                            : theme.color.fillSubtle};
                        }
                      `}
                      onClick={() => {
                        setSelectedValues((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((v) => v !== opt.value)
                            : [...prev, opt.value]
                        );
                      }}
                    >
                      <span
                        css={css`
                          width: 18px;
                          height: 18px;
                          border-radius: ${theme.radius.sm};
                          border: 2px solid ${isSelected ? theme.color.primary : theme.color.border};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
                          ${isSelected
                            ? css`
                                background: ${theme.color.primary};
                                border-color: ${theme.color.primary};
                              `
                            : ''}
                        `}
                      >
                        {isSelected && (
                          <Check size={12} color={theme.color.textInverse} strokeWidth={3} />
                        )}
                      </span>
                      <span
                        css={css`
                          font-size: ${theme.font.size.base};
                          color: ${theme.color.text};
                        `}
                      >
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                css={css`
                  display: flex;
                  justify-content: flex-end;
                  margin-top: ${theme.spacing[4]};
                `}
              >
                <button
                  css={[buttonBaseCss(theme), solidButtonCss(theme), disabledButtonCss]}
                  disabled={selectedValues.length === 0}
                  onClick={() => handleSubmit(selectedValues)}
                >
                  {t('common.submit')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
