/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { useState, type ReactNode } from 'react';
import { ExpandableItem } from './ExpandableItem.js';
import type { ExpandableItemProps, ExpandableItemContext } from './ExpandableItem.js';

const meta: Meta<typeof ExpandableItem> = {
  title: 'Shared/ExpandableItem',
  component: ExpandableItem,
  tags: ['autodocs'],
  argTypes: {
    renderSummary: { control: false },
    renderDetail: { control: false },
  },
};

export default meta;
type Story = StoryObj<ExpandableItemProps>;

/** Style helper for event log rows used in stories. */
function EventLogRow({
  status,
  label,
  time,
  ctx,
}: {
  status: 'ok' | 'warn' | 'error';
  label: string;
  time: string;
  ctx: ExpandableItemContext;
}) {
  const theme = useTheme();
  const statusColor =
    status === 'ok'
      ? theme.color.success
      : status === 'warn'
        ? theme.color.warning
        : theme.color.error;

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        cursor: ${ctx.expanded ? 'pointer' : 'pointer'};
        &:hover {
          background: ${theme.color.fillTertiary};
        }
      `}
      onClick={ctx.toggle}
    >
      <span
        css={css`
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${statusColor};
          flex-shrink: 0;
        `}
      />
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.text};
          flex: 1;
        `}
      >
        {label}
      </span>
      <span
        css={css`
          font-size: ${theme.font.size.xs};
          color: ${theme.color.textTertiary};
        `}
      >
        {time}
      </span>
    </div>
  );
}

/** Style helper for JSON detail blocks. */
function JsonDetail({ data }: { data: Record<string, unknown> }) {
  const theme = useTheme();
  return (
    <pre
      css={css`
        margin: 0;
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        font-size: ${theme.font.size.xs};
        background: ${theme.color.fillSecondary};
        color: ${theme.color.textSecondary};
        line-height: 1.5;
        overflow-x: auto;
      `}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/** A list of expandable event log rows with JSON details. */
export const EventLogItems: Story = {
  render: () => (
    <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow status="ok" label="Agent started" time="10:01:23" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail data={{ pid: 8492, runtime: 'colts', version: '0.3.0' }} />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow status="ok" label="Executed ReadFile" time="10:01:25" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail data={{ tool: 'ReadFile', path: '/src/runner.ts', lines: 142 }} />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow status="warn" label="Retry attempt 2/3" time="10:01:30" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail data={{ error: 'ECONNRESET', host: 'api.example.com', backoff: 2000 }} />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow status="error" label="Tool execution failed" time="10:01:35" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail
            data={{ tool: 'RunCommand', exitCode: 1, stderr: 'Permission denied' }}
          />
        )}
      />
    </div>
  ),
};

/** Style helper for test case rows. */
function TestCaseRow({
  name,
  passed,
  ctx,
}: {
  name: string;
  passed: boolean;
  ctx: ExpandableItemContext;
}) {
  const theme = useTheme();
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        cursor: ${ctx.expanded ? 'pointer' : 'pointer'};
        &:hover {
          background: ${theme.color.fillTertiary};
        }
      `}
      onClick={ctx.toggle}
    >
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${passed ? theme.color.success : theme.color.error};
        `}
      >
        {passed ? '✓' : '✗'}
      </span>
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.text};
          flex: 1;
        `}
      >
        {name}
      </span>
    </div>
  );
}

/** Test case list: passed items are not expandable, failed ones show error details. */
export const TestCaseItems: Story = {
  render: () => (
    <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
      <ExpandableItem
        expandable={false}
        renderSummary={(ctx) => <TestCaseRow name="should render header" passed ctx={ctx} />}
      />
      <ExpandableItem
        expandable={false}
        renderSummary={(ctx) => (
          <TestCaseRow name="should apply theme colors" passed ctx={ctx} />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <TestCaseRow name="should handle empty input" passed={false} ctx={ctx} />
        )}
        renderDetail={() => (
          <div style={{ padding: '8px 16px', color: '#ef4444', fontSize: '13px' }}>
            AssertionError: expected &quot;&quot; to equal &quot;undefined&quot;
            <br />
            at Context.&lt;anonymous&gt; (test/unit/input.test.ts:42:18)
          </div>
        )}
      />
      <ExpandableItem
        expandable={false}
        renderSummary={(ctx) => (
          <TestCaseRow name="should debounce onChange" passed ctx={ctx} />
        )}
      />
    </div>
  ),
};

/** Single expandable item with React.useState to demonstrate controlled toggle. */
export const SingleItem: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    return (
      <div
        css={css`
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.md};
          overflow: hidden;
          width: 100%;
        `}
      >
        <ExpandableItem
          expanded={expanded}
          onToggle={(next) => setExpanded(next)}
          renderSummary={(ctx) => (
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: ${theme.spacing[2]} ${theme.spacing[3]};
                cursor: pointer;
                &:hover {
                  background: ${theme.color.fillTertiary};
                }
              `}
              onClick={ctx.toggle}
            >
              <span css={css`font-size: ${theme.font.size.sm}; color: ${theme.color.text};`}>
                Click to {ctx.expanded ? 'collapse' : 'expand'}
              </span>
              <span
                css={css`
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textTertiary};
                  background: ${theme.color.fillSecondary};
                  padding: 2px 8px;
                  border-radius: ${theme.radius.sm};
                `}
              >
                {expanded ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          )}
          renderDetail={() => (
            <div
              css={css`
                padding: ${theme.spacing[3]};
                background: ${theme.color.fillSecondary};
                font-size: ${theme.font.size.sm};
                color: ${theme.color.textSecondary};
              `}
            >
              This content is controlled via React.useState. The expanded state is:{' '}
              <strong>{expanded ? 'true' : 'false'}</strong>.
            </div>
          )}
        />
      </div>
    );
  },
};
