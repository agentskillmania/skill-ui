import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState.js';
import type { EmptyStateProps } from './EmptyState.js';

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmptyStateProps>;

/** Default empty state with title and description. */
export const Default: Story = {
  args: {
    title: 'No Data',
    description: 'There are no items to display.',
  },
};

/** Empty state with a call-to-action button. */
export const WithAction: Story = {
  args: {
    title: 'No Sessions',
    description: 'Start a new session to begin.',
    action: (
      <button
        style={{
          padding: '4px 16px',
          borderRadius: '6px',
          background: '#4361ee',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        New Session
      </button>
    ),
  },
};

/** Compact inline variant with reduced padding and horizontal layout. */
export const Compact: Story = {
  args: {
    compact: true,
    description: 'No matching results',
  },
};

/** Empty state with a custom icon instead of the default antd Empty. */
export const CustomIcon: Story = {
  args: {
    title: 'Not Found',
    icon: <span style={{ fontSize: '48px' }}>{'🔍'}</span>,
  },
};
