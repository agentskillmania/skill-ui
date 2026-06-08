import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitDivider } from './SplitDivider.js';

const meta: Meta<typeof SplitDivider> = {
  title: 'Cockpit/SplitDivider',
  component: SplitDivider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '300px', display: 'flex' }}>
        <div style={{ flex: 1, background: '#f0f0f0' }}>Left</div>
        <Story />
        <div style={{ width: 200, background: '#e0e0e0' }}>Right</div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SplitDivider>;

export const Default: Story = {
  args: {
    onResize: (width: number) => console.log('resized to', width),
  },
};

export const Disabled: Story = {
  args: {
    onResize: () => {},
    disabled: true,
  },
};
