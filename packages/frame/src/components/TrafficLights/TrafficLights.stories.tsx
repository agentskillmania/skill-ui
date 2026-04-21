/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { TrafficLights } from './TrafficLights.js';

const meta: Meta<typeof TrafficLights> = {
  title: 'Frame/TrafficLights',
  component: TrafficLights,
  argTypes: {
    isMaximized: { control: 'boolean' },
    onClose: { action: 'close' },
    onMinimize: { action: 'minimize' },
    onMaximize: { action: 'maximize' },
  },
};

export default meta;
type Story = StoryObj<typeof TrafficLights>;

export const Default: Story = {};

export const Maximized: Story = {
  args: { isMaximized: true },
};
