/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { useState } from 'react';
import { SplitDivider } from './SplitDivider.js';
import type { SplitDividerProps } from './SplitDivider.js';

const meta: Meta<typeof SplitDivider> = {
  title: 'Shared/SplitDivider',
  component: SplitDivider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SplitDividerProps>;

/** Default split layout with a draggable divider between left and right panels. */
export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [rightWidth, setRightWidth] = useState(280);
    const theme = useTheme();

    return (
      <div
        css={css`
          height: 300px;
          display: flex;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.md};
          overflow: hidden;
        `}
      >
        <div
          css={css`
            flex: 1;
            background: ${theme.color.fillSecondary};
            padding: ${theme.spacing[4]};
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
            `}
          >
            Left Panel
          </span>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              color: ${theme.color.textSecondary};
            `}
          >
            This panel takes remaining space. Drag the divider to resize.
          </span>
        </div>
        <SplitDivider onResize={setRightWidth} />
        <div
          css={css`
            width: ${rightWidth}px;
            background: ${theme.color.bgBase};
            padding: ${theme.spacing[4]};
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
            overflow: hidden;
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.semibold};
            `}
          >
            Right Panel
          </span>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              color: ${theme.color.textSecondary};
            `}
          >
            Width: {rightWidth}px
          </span>
        </div>
      </div>
    );
  },
};

/** Disabled divider — no drag interaction, appears as a static separator. */
export const Disabled: Story = {
  render: () => {
    const theme = useTheme();

    return (
      <div
        css={css`
          height: 300px;
          display: flex;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.md};
          overflow: hidden;
        `}
      >
        <div
          css={css`
            flex: 1;
            background: ${theme.color.fillSecondary};
            padding: ${theme.spacing[4]};
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.base};
            `}
          >
            Left Panel
          </span>
        </div>
        <SplitDivider onResize={() => {}} disabled />
        <div
          css={css`
            width: 200px;
            background: ${theme.color.bgBase};
            padding: ${theme.spacing[4]};
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.base};
            `}
          >
            Right Panel
          </span>
        </div>
      </div>
    );
  },
};
