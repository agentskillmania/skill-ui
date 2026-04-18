import { css } from '@emotion/react';
import type { Theme } from '../../src/index';

const colorGroups = [
  {
    title: '品牌',
    keys: ['primary', 'primaryHover', 'primaryActive', 'primaryBg'],
  },
  {
    title: '语义',
    keys: [
      'success',
      'successBg',
      'successBorder',
      'warning',
      'warningBg',
      'warningBorder',
      'error',
      'errorBg',
      'errorBorder',
      'info',
      'infoBg',
      'infoBorder',
    ],
  },
  {
    title: '扩展颜色',
    keys: [
      'green',
      'greenBg',
      'blue',
      'blueBg',
      'purple',
      'purpleBg',
      'orange',
      'orangeBg',
      'cyan',
      'cyanBg',
    ],
  },
  {
    title: '背景',
    keys: ['bgBase', 'bgContainer', 'bgElevated', 'bgSpotlight', 'bgMask'],
  },
  {
    title: '文字',
    keys: [
      'text',
      'textSecondary',
      'textTertiary',
      'textQuaternary',
      'textDisabled',
      'textInverse',
    ],
  },
  {
    title: '边框',
    keys: ['border', 'borderSecondary', 'borderHover', 'borderActive'],
  },
  {
    title: '填充',
    keys: ['fill', 'fillSecondary', 'fillTertiary', 'fillSubtle', 'fillLight'],
  },
  {
    title: '链接',
    keys: ['link', 'linkHover', 'linkActive'],
  },
  {
    title: '玻璃效果',
    keys: ['glassLight', 'glassLightStrong'],
  },
  {
    title: '交互状态',
    keys: ['hoverOverlay', 'activeOverlay'],
  },
];

export function ColorTokens({ theme }: { theme: Theme }) {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[6]};
      `}
    >
      {colorGroups.map((group) => (
        <div key={group.title}>
          <h3
            css={css`
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
              margin-bottom: ${theme.spacing[3]};
              color: ${theme.color.textSecondary};
            `}
          >
            {group.title}
          </h3>
          <div
            css={css`
              display: flex;
              flex-wrap: wrap;
              gap: ${theme.spacing[3]};
            `}
          >
            {group.keys.map((key) => {
              const value = theme.color[key];
              if (!value) return null;
              const isTransparent = value.includes('rgba');
              return (
                <div
                  key={key}
                  css={css`
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: ${theme.spacing[1]};
                    width: 120px;
                  `}
                >
                  <div
                    css={css`
                      width: 56px;
                      height: 56px;
                      border-radius: ${theme.radius.md};
                      background: ${value};
                      border: 1px solid ${isTransparent ? theme.color.border : 'transparent'};
                    `}
                  />
                  <span
                    css={css`
                      font-size: ${theme.font.size.xs};
                      font-weight: ${theme.font.weight.medium};
                      color: ${theme.color.text};
                      text-align: center;
                    `}
                  >
                    {key}
                  </span>
                  <span
                    css={css`
                      font-size: ${theme.font.size.xs};
                      color: ${theme.color.textTertiary};
                      font-family: ${theme.font.familyMono};
                    `}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
