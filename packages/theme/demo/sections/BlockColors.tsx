import { css } from '@emotion/react';
import type { Theme } from '../../src/index';

const blockTypes = [
  { key: 'thinking', label: 'Thinking（思考）' },
  { key: 'humanInput', label: 'Human Input（用户输入）' },
  { key: 'toolMcp', label: 'Tool MCP' },
  { key: 'toolScript', label: 'Tool Script' },
  { key: 'toolBuiltin', label: 'Tool Builtin' },
  { key: 'plan', label: 'Plan（计划）' },
];

export function BlockColors({ theme }: { theme: Theme }) {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[4]};
      `}
    >
      {blockTypes.map(({ key, label }) => {
        const item = theme.blockColor[key];
        if (!item) return null;
        const color = item.text;
        const bg = item.bg;
        return (
          <div
            key={key}
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[4]};
              padding: ${theme.spacing[3]} ${theme.spacing[4]};
              border-radius: ${theme.radius.md};
              border-left: 4px solid ${color};
              background: ${bg};
            `}
          >
            <div
              css={css`
                width: 32px;
                height: 32px;
                border-radius: ${theme.radius.sm};
                background: ${color};
                flex-shrink: 0;
              `}
            />
            <div>
              <div
                css={css`
                  font-weight: ${theme.font.weight.medium};
                  font-size: ${theme.font.size.base};
                `}
              >
                {label}
              </div>
              <div
                css={css`
                  font-family: ${theme.font.familyMono};
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textTertiary};
                `}
              >
                {color} / {bg}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
