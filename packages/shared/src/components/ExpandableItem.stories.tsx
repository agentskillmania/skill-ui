/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

/** Colored type tag for event log entries. */
function EventTypeTag({ type }: { type: string }) {
  const theme = useTheme();
  const colorMap: Record<string, { bg: string; text: string }> = {
    agent: { bg: 'rgba(34,197,94,0.1)', text: theme.color.success },
    tool: { bg: 'rgba(67,97,238,0.1)', text: theme.color.primary },
    context: { bg: 'rgba(234,179,8,0.1)', text: theme.color.warning },
    error: { bg: 'rgba(239,68,68,0.1)', text: theme.color.error },
    info: { bg: theme.color.fillSecondary, text: theme.color.textSecondary },
  };
  const colors = colorMap[type] || colorMap.info;

  return (
    <span
      css={css`
        font-size: ${theme.font.size.xs};
        padding: 1px 8px;
        border-radius: ${theme.radius.sm};
        background: ${colors.bg};
        color: ${colors.text};
        font-weight: ${theme.font.weight.medium};
        flex-shrink: 0;
      `}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

/** Event log row with type tag, content, and timestamp. */
function EventLogRow({
  type,
  label,
  time,
  ctx,
}: {
  type: 'agent' | 'tool' | 'context' | 'error' | 'info';
  label: string;
  time: string;
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
        cursor: pointer;
        transition: background ${theme.motion.duration.fast};
        &:hover {
          background: ${theme.color.fillTertiary};
        }
      `}
      onClick={ctx.toggle}
    >
      <span
        css={css`
          font-size: 10px;
          color: ${theme.color.textTertiary};
          width: 16px;
          text-align: center;
          transition: transform 150ms ${theme.motion.easing.out};
          transform: rotate(${ctx.expanded ? 90 : 0}deg);
          flex-shrink: 0;
        `}
      >
        ▶
      </span>
      <EventTypeTag type={type} />
      <span
        css={css`
          font-size: ${theme.font.size.sm};
          color: ${theme.color.text};
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        {label}
      </span>
      <span
        css={css`
          font-size: ${theme.font.size.xs};
          color: ${theme.color.textTertiary};
          flex-shrink: 0;
        `}
      >
        {time}
      </span>
    </div>
  );
}

/** JSON detail block with monospace formatting. */
function JsonDetail({ data }: { data: Record<string, unknown> }) {
  const theme = useTheme();
  return (
    <pre
      css={css`
        margin: 0;
        padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[2]} 44px;
        font-size: ${theme.font.size.xs};
        background: ${theme.color.fillSecondary};
        color: ${theme.color.textSecondary};
        line-height: 1.5;
        overflow-x: auto;
        border-top: 1px solid ${theme.color.borderSecondary};
      `}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/** A list of expandable event log rows with colored type tags and JSON details. */
export const EventLogItems: Story = {
  render: () => (
    <div
      style={{
        width: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow type="agent" label="Agent started" time="10:01:23" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail data={{ pid: 8492, runtime: 'colts', version: '0.3.0' }} />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow type="tool" label="readFile('src/runner.ts')" time="10:01:25" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail
            data={{ tool: 'readFile', args: { path: 'src/runner.ts' }, result: '142 lines' }}
          />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow type="context" label="Context compressed 12.4k → 3.2k" time="10:01:30" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail
            data={{
              anchor: 'user-request-refactor',
              removed: 9200,
              summary: 'User requested JWT refactoring...',
            }}
          />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow type="error" label="Tool execution failed" time="10:01:35" ctx={ctx} />
        )}
        renderDetail={() => (
          <JsonDetail
            data={{ tool: 'runCommand', exitCode: 1, stderr: 'Permission denied' }}
          />
        )}
      />
      <ExpandableItem
        renderSummary={(ctx) => (
          <EventLogRow type="info" label="Session completed" time="10:02:01" ctx={ctx} />
        )}
      />
    </div>
  ),
};

/** Test case rows — passed items not expandable, failed ones show error details. */
export const TestCaseItems: Story = {
  render: () => {
    const theme = useTheme();
    const tests = [
      { name: 'should render header', passed: true },
      { name: 'should apply theme colors', passed: true },
      { name: 'should handle empty input', passed: false },
      { name: 'should debounce onChange', passed: true },
    ];

    return (
      <div
        style={{
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {tests.map((test, i) => (
          <ExpandableItem
            key={i}
            expandable={!test.passed}
            renderSummary={(ctx) => (
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  gap: ${theme.spacing[2]};
                  padding: ${theme.spacing[2]} ${theme.spacing[3]};
                  font-size: ${theme.font.size.sm};
                  color: ${test.passed ? theme.color.text : theme.color.error};
                  cursor: ${test.passed ? 'default' : 'pointer'};
                  &:hover {
                    background: ${test.passed ? 'transparent' : theme.color.fillTertiary};
                  }
                `}
              >
                <span
                  css={css`
                    width: 20px;
                    text-align: center;
                    color: ${test.passed ? theme.color.success : theme.color.error};
                    font-weight: ${theme.font.weight.bold};
                  `}
                >
                  {test.passed ? '✓' : '✗'}
                </span>
                <span css={css`flex: 1; color: ${test.passed ? theme.color.text : theme.color.error};`}>
                  {test.name}
                </span>
              </div>
            )}
            renderDetail={
              test.passed
                ? undefined
                : () => (
                    <div
                      css={css`
                        padding: ${theme.spacing[2]} ${theme.spacing[4]};
                        font-size: ${theme.font.size.xs};
                        color: ${theme.color.error};
                        background: rgba(239, 68, 68, 0.04);
                        border-top: 1px solid rgba(239, 68, 68, 0.1);
                        font-family: ${theme.font.familyMono};
                      `}
                    >
                      AssertionError: expected &quot;&quot; to equal &quot;undefined&quot;
                      <br />
                      at Context.&lt;anonymous&gt; (test/unit/input.test.ts:42:18)
                    </div>
                  )
            }
          />
        ))}
      </div>
    );
  },
};

/** Single expandable item with controlled state via React.useState. */
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
                transition: background ${theme.motion.duration.fast};
                &:hover {
                  background: ${theme.color.fillTertiary};
                }
              `}
              onClick={ctx.toggle}
            >
              <div css={css`display: flex; align-items: center; gap: ${theme.spacing[2]};`}>
                {ctx.expanded ? (
                  <ChevronDown size={14} css={css`color: ${theme.color.textTertiary};`} />
                ) : (
                  <ChevronRight size={14} css={css`color: ${theme.color.textTertiary};`} />
                )}
                <span css={css`font-size: ${theme.font.size.sm}; color: ${theme.color.text};`}>
                  Click to {ctx.expanded ? 'collapse' : 'expand'}
                </span>
              </div>
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
                border-top: 1px solid ${theme.color.borderSecondary};
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
