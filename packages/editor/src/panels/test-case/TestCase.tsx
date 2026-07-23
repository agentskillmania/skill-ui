/** @jsxImportSource @emotion/react */
/**
 * TestCase panel — test case management
 *
 * Uses shared components: ExpandableRow, SectionLabel
 * Title bar provided by parent SidebarPanel.
 */
import {
  ExpandableRow,
  SectionLabel,
  EmptyState,
  formatDuration,
} from '@agentskillmania/skill-ui-shared';
import { useTheme, interactiveItem } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Play, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { TestCasePanelProps, TestCaseStatus } from '../../types.js';
import type { TestCase as TestCaseType } from '../../types.js';

const STATUS_ICON: Record<TestCaseStatus, { icon: typeof CheckCircle2; color: string }> = {
  idle: { icon: Loader, color: 'textTertiary' },
  running: { icon: Loader, color: 'primary' },
  passed: { icon: CheckCircle2, color: 'success' },
  failed: { icon: XCircle, color: 'error' },
};

function TestCaseRow({ tc, onRunCase }: { tc: TestCaseType; onRunCase?: (id: string) => void }) {
  const theme = useTheme();
  const cfg = STATUS_ICON[tc.status];
  const Icon = cfg.icon;
  const hasError = tc.status === 'failed' && !!tc.error;

  return (
    <ExpandableRow
      expandable={hasError}
      defaultExpanded={hasError}
      detailVariant="code"
      renderSummary={() => (
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${theme.spacing[1]} ${theme.spacing[2]};
            border-radius: ${theme.radius.xs};
            font-size: ${theme.font.size.xs};
            margin-bottom: ${theme.spacing['0.5']};
            ${interactiveItem(theme, theme.color.fillSubtle)}
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[1]};
              flex: 1;
              min-width: 0;
            `}
          >
            <span
              css={css`
                color: ${theme.color[cfg.color]};
                display: flex;
                align-items: center;
                ${tc.status === 'running' ? 'animation: spin 1s linear infinite;' : ''}

                @keyframes spin {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}
            >
              <Icon size={14} />
            </span>
            <span
              css={css`
                color: ${theme.color.text};
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {tc.name}
            </span>
            {tc.duration != null && (
              <span
                css={css`
                  color: ${theme.color.textTertiary};
                  flex-shrink: 0;
                `}
              >
                {formatDuration(tc.duration)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunCase?.(tc.id);
            }}
            disabled={tc.status === 'running'}
            css={css`
              border: none;
              background: none;
              cursor: ${tc.status === 'running' ? 'not-allowed' : 'pointer'};
              color: ${tc.status === 'running'
                ? theme.color.textTertiary
                : theme.color.textSecondary};
              padding: 0;
              display: flex;
              flex-shrink: 0;
            `}
            type="button"
          >
            <Play size={12} />
          </button>
        </div>
      )}
      renderDetail={
        tc.error
          ? () => (
              <div
                css={css`
                  padding: ${theme.spacing[1]} ${theme.spacing[2]};
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.error};
                `}
              >
                <SectionLabel>{tc.error}</SectionLabel>
              </div>
            )
          : undefined
      }
    />
  );
}

export function TestCase({ cases, onRunAll, onRunCase }: TestCasePanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const runAllButton = (
    <button
      onClick={() => onRunAll?.()}
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing['0.5']};
        padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
        border: none;
        border-radius: ${theme.radius.xs};
        background: ${theme.color.primary};
        color: white;
        cursor: pointer;
        font-size: ${theme.font.size.xs};
        transition: opacity ${theme.motion.duration.fast};

        &:hover {
          opacity: 0.85;
        }
      `}
      type="button"
    >
      <Play size={12} /> {t('testCase.runAll')}
    </button>
  );

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* Run All action bar */}
      <div
        css={css`
          display: flex;
          justify-content: flex-end;
          padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
          flex-shrink: 0;
        `}
      >
        {runAllButton}
      </div>

      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          padding: ${theme.spacing[1]};
        `}
      >
        {(!cases || cases.length === 0) && <EmptyState description={t('testCase.emptyHint')} />}
        {cases?.map((tc) => (
          <TestCaseRow key={tc.id} tc={tc} onRunCase={onRunCase} />
        ))}
      </div>
    </div>
  );
}
