/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { Zap } from 'lucide-react';
import { AppBrand } from './AppBrand.js';

const meta: Meta<typeof AppBrand> = {
  title: 'Frame/AppBrand',
  component: AppBrand,
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AppBrand>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: { title: 'Agent IDE' },
};

export const SingleWord: Story = {
  args: { title: 'Studio' },
};

export const WithIcon: Story = {
  args: { icon: <Zap size={16} /> },
};

export const CustomWithIcon: Story = {
  args: { title: 'Agent IDE', icon: <Zap size={16} /> },
};
