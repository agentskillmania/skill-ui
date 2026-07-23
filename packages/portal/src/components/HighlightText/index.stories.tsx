import type { Meta, StoryObj } from '@storybook/react-vite';
import { HighlightText } from './index.js';

const meta: Meta<typeof HighlightText> = {
  title: 'Portal/HighlightText',
  component: HighlightText,
};

export default meta;

type Story = StoryObj<typeof HighlightText>;

export const NoMatch: Story = {
  args: {
    text: 'Web Search',
    query: '',
  },
};

export const SingleMatch: Story = {
  args: {
    text: 'Web Search',
    query: 'web',
  },
};

export const MultipleMatches: Story = {
  args: {
    text: 'Web Webhook Website',
    query: 'web',
  },
};

export const CaseInsensitive: Story = {
  args: {
    text: 'Web Search',
    query: 'SEARCH',
  },
};
