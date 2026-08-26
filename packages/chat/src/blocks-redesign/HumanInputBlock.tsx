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
import type { BlockProps, HumanInputMetadata, HumanInputQuestion } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

/**
 * Shared button base — layout, typography, transition, and active-state
 * feedback. Common to every action button in this block.
 */
const buttonBaseCss = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
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

/** Input control for a single question. Reports its answer up via onChange. */
function QuestionInput({
  q,
  theme,
  t,
  onChange,
}: {
  q: HumanInputQuestion;
  theme: Theme;
  t: (key: string) => string;
  onChange: (answer: { type: 'direct' | 'free-text'; value: unknown } | undefined) => void;
}) {
  const [text, setText] = useState('');
  const [single, setSingle] = useState<string | undefined>();
  const [multi, setMulti] = useState<string[]>([]);

  const labelCss = css`
    font-size: ${theme.font.size.sm};
    font-weight: ${theme.font.weight.medium};
    color: ${theme.color.textSecondary};
    margin-bottom: ${theme.spacing[2]};
  `;
  const inputCss = css`
    width: 100%;
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.color.border};
    background: ${theme.color.bgContainer};
    color: ${theme.color.text};
    font-family: ${theme.font.family};
    font-size: ${theme.font.size.base};
    outline: none;
    &:focus {
      border-color: ${theme.color.primary};
      box-shadow: 0 0 0 3px ${theme.color.primaryBg};
    }
  `;
  const optionCss = (selected: boolean) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.radius.md};
    border: 1px solid ${selected ? theme.color.primary : theme.color.border};
    background: ${selected ? theme.color.primaryBg : theme.color.bgContainer};
    cursor: pointer;
    transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
    &:hover {
      border-color: ${theme.color.primary};
      background: ${selected ? theme.color.primaryBg : theme.color.fillSubtle};
    }
  `;

  return (
    <div>
      <div css={labelCss}>{q.question}</div>
      {(q.type === 'text' || q.type === 'number') && (
        <input
          type={q.type === 'number' ? 'number' : 'text'}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onChange({ type: 'free-text', value: q.type === 'number' ? Number(v) : v });
          }}
          placeholder={t('humanInput.placeholder')}
          css={inputCss}
        />
      )}
      {q.type === 'single-select' && (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          {(q.options ?? []).map((opt) => (
            <div
              key={opt}
              css={optionCss(single === opt)}
              onClick={() => {
                setSingle(opt);
                onChange({ type: 'direct', value: opt });
              }}
            >
              <span
                css={css`
                  width: 16px;
                  height: 16px;
                  border-radius: ${theme.radius.full};
                  border: 2px solid ${single === opt ? theme.color.primary : theme.color.border};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                `}
              >
                {single === opt && (
                  <span
                    css={css`
                      width: 7px;
                      height: 7px;
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
                {opt}
              </span>
            </div>
          ))}
        </div>
      )}
      {q.type === 'multi-select' && (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          {(q.options ?? []).map((opt) => {
            const checked = multi.includes(opt);
            return (
              <div
                key={opt}
                css={optionCss(checked)}
                onClick={() => {
                  const next = checked ? multi.filter((v) => v !== opt) : [...multi, opt];
                  setMulti(next);
                  onChange(next.length ? { type: 'direct', value: next } : undefined);
                }}
              >
                <span
                  css={css`
                    width: 16px;
                    height: 16px;
                    border-radius: ${theme.radius.sm};
                    border: 2px solid ${checked ? theme.color.primary : theme.color.border};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                  `}
                >
                  {checked && <Check size={11} color={theme.color.primary} />}
                </span>
                <span
                  css={css`
                    font-size: ${theme.font.size.base};
                    color: ${theme.color.text};
                  `}
                >
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Multi-question form: renders one QuestionInput per question, collects all
 * answers into a { [questionId]: { type, value } } object on submit. */
function MultiQuestionForm({
  questions,
  theme,
  t,
  onSubmit,
}: {
  questions: HumanInputQuestion[];
  theme: Theme;
  t: (key: string) => string;
  onSubmit: (response: Record<string, unknown>) => void;
}) {
  // answers[qId] = { type, value } | undefined (undefined = not yet answered)
  const [answers, setAnswers] = useState<
    Record<string, { type: 'direct' | 'free-text'; value: unknown } | undefined>
  >({});

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = () => {
    const result: Record<string, unknown> = {};
    for (const q of questions) {
      const a = answers[q.id];
      if (a) result[q.id] = a;
    }
    onSubmit(result);
  };

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[3]};
      `}
    >
      {questions.map((q) => (
        <QuestionInput
          key={q.id}
          q={q}
          theme={theme}
          t={t}
          onChange={(ans) => setAnswers((prev) => ({ ...prev, [q.id]: ans }))}
        />
      ))}
      <div
        css={css`
          display: flex;
          justify-content: flex-end;
        `}
      >
        <button
          css={[buttonBaseCss(theme), solidButtonCss(theme), disabledButtonCss]}
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          <SendHorizontal size={12} />
          {t('common.submit')}
        </button>
      </div>
    </div>
  );
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
  // 已回复后自动收起；待回复时不可收起
  const { expanded, toggle } = useBlockCollapse(!isPending);

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
      {/* Header — pending 状态不可收起（答案表单不能被藏起来），已回复可收起 */}
      <div
        onClick={!isPending ? toggle : undefined}
        aria-expanded={isPending ? true : expanded}
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          ${!isPending && !expanded ? 'border-bottom: none;' : ''}
          ${!isPending ? 'cursor: pointer;' : ''}
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: ${theme.radius.md};
            /* 用户输入 = 品牌色身份（同 ErrorBlock 实心红先例） */
            background: ${theme.color.primary};
            color: ${theme.color.textInverse};
            flex-shrink: 0;
          `}
        >
          <User size={13} />
        </div>
        <div
          css={css`
            flex: 1;
            min-width: 0;
          `}
        >
          <div
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {meta?.title ?? t('humanInput.needConfirm')}
          </div>
        </div>
        <span
          css={css`
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            padding: ${isPending ? '2px 8px' : '0'};
            border-radius: ${theme.radius.full};
            background: ${isPending ? theme.color.primaryBg : 'transparent'};
            color: ${isPending ? theme.color.primary : theme.color.success};
            border: none;
            flex-shrink: 0;
          `}
        >
          {isPending ? t('humanInput.pending') : t('humanInput.replied')}
        </span>
        {!isPending && (
          <span
            css={css`
              color: ${theme.color.textTertiary};
              flex-shrink: 0;
              display: inline-flex;
            `}
          >
            <CollapseChevron expanded={expanded} />
          </span>
        )}
      </div>

      {/* Body */}
      {!isPending ? (
        /* Completed state — green text on the card's own background, no green band */
        expanded && (
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              padding: ${theme.spacing[2]} ${theme.spacing[4]};
              font-size: ${theme.font.size.base};
              color: ${theme.color.success};
              font-weight: ${theme.font.weight.medium};
            `}
          >
            <Check size={12} style={{ opacity: 0.6 }} />
            {formatResponse(meta?.response, t) || t('humanInput.completed')}
          </div>
        )
      ) : (
        /* Pending state */
        <div
          css={css`
            padding: ${theme.spacing[3]};
          `}
        >
          {meta?.message && !meta?.questions && (
            <div
              css={css`
                font-size: ${theme.font.size.base};
                line-height: ${theme.font.lineHeightRelaxed};
                color: ${theme.color.textSecondary};
                margin-bottom: ${theme.spacing[3]};
              `}
            >
              {meta.message}
            </div>
          )}

          {/* Multi-question form (ask_human with >1 questions) */}
          {meta?.questions && meta.questions.length > 0 && (
            <MultiQuestionForm
              questions={meta.questions}
              theme={theme}
              t={t}
              onSubmit={(response) => handleSubmit(response)}
            />
          )}

          {/* Single-question controls — only when no multi-question form */}
          {!meta?.questions && inputType === 'confirmation' && (
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
                <Check size={12} />
                {t('common.confirm')}
              </button>
            </div>
          )}

          {/* Text input */}
          {!meta?.questions && inputType === 'input' && (
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
                  padding: ${theme.spacing[1]} ${theme.spacing[3]};
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
                <SendHorizontal size={12} />
                {t('common.submit')}
              </button>
            </div>
          )}

          {/* Single select */}
          {!meta?.questions && inputType === 'single-select' && meta?.options && (
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
                        gap: ${theme.spacing[2]};
                        padding: ${theme.spacing[1]} ${theme.spacing[2]};
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
                          width: 16px;
                          height: 16px;
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
                              width: 7px;
                              height: 7px;
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
                  margin-top: ${theme.spacing[3]};
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
          {!meta?.questions && inputType === 'multi-select' && meta?.options && (
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
                        gap: ${theme.spacing[2]};
                        padding: ${theme.spacing[1]} ${theme.spacing[2]};
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
                          width: 16px;
                          height: 16px;
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
                          <Check size={11} color={theme.color.textInverse} strokeWidth={3} />
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
                  margin-top: ${theme.spacing[3]};
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
