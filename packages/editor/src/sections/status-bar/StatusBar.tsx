/** @jsxImportSource @emotion/react */
/**
 * Status bar component — includes mode switch
 */
import { memo } from 'react';
import { css } from '@emotion/react';
import { Code, Eye } from 'lucide-react';
import { useTheme, interactiveItem, borderSeparator } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../../locales/index.js';
import { VISUAL_EDITOR_EXTENSIONS, getExtension } from '../../utils/file-extensions.js';
import type { StatusBarProps, EditMode } from '../../types.js';

/** Check whether a file path is supported by the visual editor */
function isVisualEditable(filePath: string | null): boolean {
  if (!filePath) return false;
  return (VISUAL_EDITOR_EXTENSIONS as readonly string[]).includes(getExtension(filePath));
}

export const StatusBar = memo(function StatusBar({
  filePath,
  editMode,
  cursorPosition,
  isDirty,
  onEditModeChange,
}: StatusBarProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 ${theme.spacing[2]};
        height: 28px;
        ${borderSeparator(theme, 'top')}
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
        {/* Mode switch — only show preview toggle for markdown files */}
        {isVisualEditable(filePath) && (
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

              ${interactiveItem(theme, theme.color.fillSubtle)}
              &:hover {
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
        )}
      </div>
    </div>
  );
});
