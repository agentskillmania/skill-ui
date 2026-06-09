/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { CollapsibleCard } from './CollapsibleCard.js';
import type { CollapsibleCardProps } from './CollapsibleCard.js';

const meta: Meta<typeof CollapsibleCard> = {
  title: 'Shared/CollapsibleCard',
  component: CollapsibleCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CollapsibleCardProps>;

/** Helper to render a key-value row inside a card. */
function KVRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <div
      css={css`
        display: flex;
        justify-content: space-between;
        padding: ${theme.spacing[1]} 0;
        &:not(:last-child) {
          border-bottom: 1px solid ${theme.color.borderSecondary};
        }
      `}
    >
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.textSecondary};
        `}
      >
        {label}
      </span>
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.text};
          font-weight: ${theme.font.weight.medium};
        `}
      >
        {value}
      </span>
    </div>
  );
}

/** Expanded card showing session overview data. */
export const Expanded: Story = {
  render: () => (
    <CollapsibleCard title="Session Overview" defaultCollapsed={false}>
      <KVRow label="Session ID" value="sess-abc123" />
      <KVRow label="Agent" value="Code Assistant" />
      <KVRow label="Status" value="Running" />
      <KVRow label="Duration" value="2m 34s" />
    </CollapsibleCard>
  ),
};

/** Collapsed card — content hidden, only header visible. */
export const Collapsed: Story = {
  render: () => (
    <CollapsibleCard title="Session Overview" defaultCollapsed>
      <KVRow label="Session ID" value="sess-abc123" />
      <KVRow label="Agent" value="Code Assistant" />
    </CollapsibleCard>
  ),
};

/** Card with a status badge in the header. */
export const WithBadge: Story = {
  render: () => (
    <CollapsibleCard
      title="Agent State"
      badge={
        <span
          style={{
            fontSize: '11px',
            padding: '1px 8px',
            borderRadius: '4px',
            background: 'rgba(67,97,238,0.08)',
            color: '#4361ee',
          }}
        >
          Running
        </span>
      }
    >
      <KVRow label="Model" value="claude-sonnet-4" />
      <KVRow label="Tokens Used" value="12,847" />
      <KVRow label="Tools Available" value="8" />
    </CollapsibleCard>
  ),
};

/** Multiple cards stacked to demonstrate a dashboard-like layout. */
export const MultipleCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <CollapsibleCard title="Session Overview" defaultCollapsed={false}>
        <KVRow label="Session ID" value="sess-abc123" />
        <KVRow label="Agent" value="Code Assistant" />
        <KVRow label="Status" value="Running" />
      </CollapsibleCard>
      <CollapsibleCard title="Agent State" defaultCollapsed>
        <KVRow label="Model" value="claude-sonnet-4" />
        <KVRow label="Tokens Used" value="12,847" />
      </CollapsibleCard>
      <CollapsibleCard
        title="Skills"
        defaultCollapsed={false}
        badge={
          <span
            style={{
              fontSize: '11px',
              padding: '1px 8px',
              borderRadius: '4px',
              background: 'rgba(34,197,94,0.08)',
              color: '#16a34a',
            }}
          >
            5 loaded
          </span>
        }
      >
        <KVRow label="Active Skills" value="browse, code-review, ship" />
        <KVRow label="Last Updated" value="2 hours ago" />
      </CollapsibleCard>
    </div>
  ),
};
