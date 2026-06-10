/** @jsxImportSource @emotion/react */
/**
 * TestCase panel — test case management
 */
import { css } from '@emotion/react';
import { TestTube2, Play, Circle, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme, interactiveItem, borderSeparator } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { useToggle, EmptyState } from '@agentskillmania/skill-ui-shared';
import { NAMESPACE } from '../../locales/index.js';
import type { TestCasePanelProps, TestCaseStatus } from '../../types.js';
import type { TestCase as TestCaseType } from '../../types.js';

const STATUS_ICON: Record<TestCaseStatus, { icon: typeof Circle; color: string }> = {
  idle: { icon: Circle, color: 'textTertiary' },
  running: { icon: Loader, color: 'primary' },
  passed: { icon: CheckCircle2, color: 'success' },
  failed: { icon: XCircle, color: 'error' },
};

function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function TestCaseRow({ tc, onRunCase }: { tc: TestCaseType; onRunCase?: (id: string) => void }) {
  const theme = useTheme();
  const expandedToggle = useToggle(tc.status === 'failed' && !!tc.error);
  const cfg = STATUS_ICON[tc.status];
  const Icon = cfg.icon;

  return (
    <div
      css={css`
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
          justify-content: space-between;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
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
            `}
          >
            {tc.name}
          </span>
          {tc.duration != null && (
            <span
              css={css`
                color: ${theme.color.textTertiary};
              `}
            >
              {formatDuration(tc.duration)}
            </span>
          )}
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
          `}
        >
          {tc.status === 'failed' && tc.error && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                expandedToggle.toggle();
              }}
              css={css`
                border: none;
                background: none;
                cursor: pointer;
                color: ${theme.color.textTertiary};
                font-size: ${theme.font.size.xs};
                padding: 0;
              `}
              type="button"
            >
              {expandedToggle.value ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={() => onRunCase?.(tc.id)}
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
            `}
            type="button"
          >
            <Play size={12} />
          </button>
        </div>
      </div>
      {expandedToggle.value && tc.error && (
        <div
          css={css`
            margin-top: ${theme.spacing[1]};
            margin-left: 22px;
            font-size: ${theme.font.size.xs};
            color: ${theme.color.error};
          `}
        >
          {tc.error}
        </div>
      )}
    </div>
  );
}

export function TestCase({ cases, onRunAll, onRunCase }: TestCasePanelProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* Header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          ${borderSeparator(theme)}
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            font-size: ${theme.font.size.sm};
            font-weight: ${theme.font.weight.medium};
            color: ${theme.color.text};
          `}
        >
          <TestTube2 size={14} />
          {t('testCase.title')}
        </div>
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
      </div>

      {/* Case list */}
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
