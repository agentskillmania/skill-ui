/**
 * ReviewPanel — review result panel
 *
 * Displays AI review score and check item list.
 */
import { css } from '@emotion/react';
import { CheckCircle, AlertTriangle, XCircle, ClipboardCheck } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ReviewPanelProps, ReviewItem } from '../../types.js';

/** Status → icon + color */
const STATUS_CONFIG: Record<ReviewItem['status'], { icon: typeof CheckCircle; color: string }> = {
  pass: { icon: CheckCircle, color: 'success' },
  warn: { icon: AlertTriangle, color: 'warning' },
  fail: { icon: XCircle, color: 'error' },
};

export function ReviewPanel({ result }: ReviewPanelProps) {
  const theme = useTheme();

  if (!result) {
    return (
      <div
        css={css`
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: ${theme.spacing[2]};
          color: ${theme.color.textTertiary};
          font-size: ${theme.font.size.sm};
        `}
      >
        <ClipboardCheckIcon theme={theme} />
        <span>尚未审核，通过助手发起审核</span>
      </div>
    );
  }

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* Score */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${theme.spacing[3]};
          border-bottom: 1px solid ${theme.color.borderSecondary};
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${theme.spacing[1]};
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.xl};
              font-weight: 600;
              color: ${result.score >= 80
                ? theme.color.success
                : result.score >= 60
                  ? theme.color.warning
                  : theme.color.error};
            `}
          >
            {result.score}
          </span>
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              color: ${theme.color.textTertiary};
            `}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Check item list */}
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          padding: ${theme.spacing[2]};
        `}
      >
        {result.items.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status];
          const Icon = cfg.icon;
          return (
            <div
              key={i}
              css={css`
                display: flex;
                align-items: flex-start;
                gap: ${theme.spacing[2]};
                padding: ${theme.spacing['0.5']} 0;
                font-size: ${theme.font.size.sm};
              `}
            >
              <span
                css={css`
                  flex-shrink: 0;
                  display: flex;
                  margin-top: 2px;
                  color: ${theme.color[cfg.color]};
                `}
              >
                <Icon size={14} />
              </span>
              <div
                css={css`
                  flex: 1;
                  min-width: 0;
                `}
              >
                <div
                  css={css`
                    color: ${theme.color.text};
                  `}
                >
                  {item.label}
                </div>
                {item.detail && (
                  <div
                    css={css`
                      font-size: ${theme.font.size.xs};
                      color: ${theme.color.textTertiary};
                      margin-top: ${theme.spacing['0.5']};
                    `}
                  >
                    {item.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClipboardCheckIcon({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <ClipboardCheck
      size={32}
      css={css`
        color: ${theme.color.textTertiary};
      `}
    />
  );
}
