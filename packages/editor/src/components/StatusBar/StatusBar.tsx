/**
 * Status bar component — includes mode switch
 */
import { css } from '@emotion/react';
import { Code, Eye } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import type { StatusBarProps } from '../../types.js';

export function StatusBar({
  filePath,
  editMode,
  cursorPosition,
  isDirty,
  onEditModeChange,
}: StatusBarProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-editor');

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 ${theme.spacing[2]};
        height: 28px;
        border-top: 1px solid ${theme.color.borderSecondary};
        background: ${theme.color.bgLayout};
        font-size: ${theme.font.size.xs};
        color: ${theme.color.textTertiary};
        user-select: none;
      `}
    >
      {/* Left: file info */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
        `}
      >
        {filePath && (
          <span
            css={css`
              color: ${theme.color.textSecondary};
            `}
          >
            {filePath}
          </span>
        )}
        {isDirty && (
          <span
            css={css`
              color: ${theme.color.warning};
            `}
          >
            {t('statusBar.unsaved')}
          </span>
        )}
      </div>

      {/* Right: cursor position + mode switch */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
        `}
      >
        {cursorPosition && (
          <span>
            {t('statusBar.cursorPosition', {
              line: cursorPosition.line,
              column: cursorPosition.column,
            })}
          </span>
        )}
        <button
          onClick={() => onEditModeChange(editMode === 'code' ? 'wysiwyg' : 'code')}
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing['0.5']};
            padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
            border: 1px solid ${theme.color.borderSecondary};
            border-radius: ${theme.radius.xs};
            background: transparent;
            cursor: pointer;
            color: ${theme.color.textSecondary};
            font-size: ${theme.font.size.xs};
            transition: all ${theme.motion.duration.fast};

            &:hover {
              background: ${theme.color.fillSubtle};
              color: ${theme.color.text};
            }
          `}
          type="button"
        >
          {editMode === 'code' ? (
            <>
              <Eye size={12} /> {t('statusBar.preview')}
            </>
          ) : (
            <>
              <Code size={12} /> {t('statusBar.code')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
