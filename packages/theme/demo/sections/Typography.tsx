import { css } from '@emotion/react';
import type { Theme } from '../../src/index';

export function Typography({ theme }: { theme: Theme }) {
  const sizes = Object.entries(theme.font.size);
  const weights = Object.entries(theme.font.weight);

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[6]};
      `}
    >
      {/* 字体族 */}
      <div>
        <h3 css={labelStyle(theme)}>字体族</h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          <div
            css={css`
              font-family: ${theme.font.family};
              font-size: ${theme.font.size.lg};
            `}
          >
            Sans: {theme.font.family}
          </div>
          <div
            css={css`
              font-family: ${theme.font.familyMono};
              font-size: ${theme.font.size.lg};
            `}
          >
            Mono: {theme.font.familyMono}
          </div>
        </div>
      </div>

      {/* 字号 */}
      <div>
        <h3 css={labelStyle(theme)}>字号</h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          {sizes.map(([key, value]) => (
            <div
              key={key}
              css={css`
                display: flex;
                align-items: baseline;
                gap: ${theme.spacing[3]};
                font-size: ${value};
              `}
            >
              <span css={keyStyle(theme)}>{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 字重 */}
      <div>
        <h3 css={labelStyle(theme)}>字重</h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          {weights.map(([key, value]) => (
            <div
              key={key}
              css={css`
                display: flex;
                align-items: baseline;
                gap: ${theme.spacing[3]};
                font-weight: ${value};
                font-size: ${theme.font.size.lg};
              `}
            >
              <span css={keyStyle(theme)}>{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.semibold};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.color.textSecondary};
`;

const keyStyle = (theme: Theme) => css`
  display: inline-block;
  width: 60px;
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.normal};
  color: ${theme.color.textTertiary};
  font-family: ${theme.font.familyMono};
`;
