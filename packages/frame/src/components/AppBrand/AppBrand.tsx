/** @jsxImportSource @emotion/react */
/**
 * AppBrand component
 * App brand display (icon + name), first word in default text color, second in primary color
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { AppBrandProps } from '../../types.js';

export function AppBrand({ title = 'Skill Studio', icon }: AppBrandProps) {
  const theme = useTheme();
  const words = title.split(' ');
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing['2']};
      `}
    >
      {icon && (
        <div
          css={css`
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme.color.primary};
          `}
        >
          {icon}
        </div>
      )}
      <span
        css={css`
          font-size: ${theme.font.size.lg};
          font-weight: 600;
          white-space: nowrap;
        `}
      >
        <span
          css={css`
            color: ${theme.color.text};
          `}
        >
          {firstWord}
        </span>
        {restWords && (
          <span
            css={css`
              color: ${theme.color.primary};
              margin-left: 4px;
            `}
          >
            {restWords}
          </span>
        )}
      </span>
    </div>
  );
}
