/**
 * Thinking-state toggle for the chat input toolbar.
 * Cycles null(Auto) → true(on) → false(off) → null on click.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Brain } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';

export interface ThinkingToggleProps {
  /** null/undefined=Auto, true=on, false=off */
  value?: boolean | null;
  /** Change callback */
  onChange: (value: boolean | null) => void;
  /** Disabled */
  disabled?: boolean;
}

export const ThinkingToggle = memo(function ThinkingToggle({
  value = null,
  onChange,
  disabled = false,
}: ThinkingToggleProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const handleClick = useCallback(() => {
    // null → true → false → null
    const next = value === null ? true : value === true ? false : null;
    onChange(next);
  }, [value, onChange]);

  const isOn = value === true;
  const isAuto = value !== false;
  // Resolve display label by state explicitly
  const displayLabel =
    value === null || value === undefined
      ? t('chatInput.thinking.auto')
      : value === true
        ? t('chatInput.thinking.on')
        : t('chatInput.thinking.off');
  const color = isOn
    ? theme.color.primary
    : isAuto
      ? theme.color.textSecondary
      : theme.color.textTertiary;
  const border = isOn ? theme.color.primary : theme.color.border;
  const bg = isOn ? theme.color.primaryBg : theme.color.bgContainer;

  return (
    <button
      type="button"
      data-testid="thinking-toggle"
      disabled={disabled}
      onClick={handleClick}
      aria-label={displayLabel}
      css={css`
        display: inline-flex;
        align-items: center;
        gap: ${theme.spacing[1]};
        padding: ${theme.spacing[1]} ${theme.spacing[2]};
        border: 1px solid ${border};
        border-radius: ${theme.radius.full};
        background: ${bg};
        color: ${color};
        font-size: ${theme.font.size.sm};
        line-height: 1;
        cursor: pointer;
        transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};

        &:hover:not(:disabled) {
          border-color: ${theme.color.primary};
          color: ${theme.color.primary};
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}
    >
      <Brain size={14} />
      <span>{displayLabel}</span>
    </button>
  );
});
