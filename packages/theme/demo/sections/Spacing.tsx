import { css } from '@emotion/react';
import type { Theme } from '../../src/index';

export function Spacing({ theme }: { theme: Theme }) {
  const spacings = Object.entries(theme.spacing);

  return (
    <div>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[3]};
        `}
      >
        {spacings.map(([key, value]) => {
          const px = parseInt(value);
          return (
            <div
              key={key}
              css={css`
                display: flex;
                align-items: center;
                gap: ${theme.spacing[3]};
              `}
            >
              <span
                css={css`
                  display: inline-block;
                  width: 40px;
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textTertiary};
                  font-family: ${theme.font.familyMono};
                  text-align: right;
                `}
              >
                {key}
              </span>
              <div
                css={css`
                  height: 16px;
                  width: ${Math.max(px, 1)}px;
                  background: ${theme.color.primary};
                  border-radius: ${theme.radius.xs};
                  transition: width 0.3s;
                `}
              />
              <span
                css={css`
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textSecondary};
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
  );
}
