import { css } from '@emotion/react';
import type { Theme } from '../../src/index';

export function Effects({ theme }: { theme: Theme }) {
  const shadows = Object.entries(theme.shadow);
  const blurs = Object.entries(theme.blur);
  const radii = Object.entries(theme.radius);

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[8]};
      `}
    >
      {/* 阴影 */}
      <div>
        <h3 css={labelStyle(theme)}>阴影</h3>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
            gap: ${theme.spacing[4]};
          `}
        >
          {shadows.map(([key, value]) => (
            <div
              key={key}
              css={css`
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: ${theme.spacing[2]};
              `}
            >
              <div
                css={css`
                  width: 80px;
                  height: 80px;
                  border-radius: ${theme.radius.md};
                  background: ${theme.color.bgContainer};
                  box-shadow: ${value};
                `}
              />
              <span css={tokenLabel(theme)}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 模糊 */}
      <div>
        <h3 css={labelStyle(theme)}>模糊</h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          {blurs.map(([key, value]) => (
            <div
              key={key}
              css={css`
                display: flex;
                gap: ${theme.spacing[3]};
                align-items: center;
              `}
            >
              <span css={tokenLabel(theme)}>{key}</span>
              <span
                css={css`
                  font-family: ${theme.font.familyMono};
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textSecondary};
                `}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 圆角 */}
      <div>
        <h3 css={labelStyle(theme)}>圆角</h3>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
            gap: ${theme.spacing[4]};
          `}
        >
          {radii.map(([key, value]) => (
            <div
              key={key}
              css={css`
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: ${theme.spacing[2]};
              `}
            >
              <div
                css={css`
                  width: 56px;
                  height: 56px;
                  background: ${theme.color.primary};
                  border-radius: ${value};
                `}
              />
              <span css={tokenLabel(theme)}>
                {key}: {value}
              </span>
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

const tokenLabel = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  font-family: ${theme.font.familyMono};
  color: ${theme.color.textTertiary};
`;
