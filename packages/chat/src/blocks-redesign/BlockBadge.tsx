/**
 * Shared block-header badge — the ONE pill style for every status/type marker
 * in block headers (tool-type, running/exit status, counts, replies).
 *
 * 颜色=语义:neutral=类型/计数,primary=进行中,success=完成,error=失败,
 * warning=等待,solidError=Error 块的错误码(实底,异常块的专属强调)。
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';
import type { ReactNode } from 'react';

const subtlePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

export type BlockBadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'solidError';

export interface BlockBadgeProps {
  variant: BlockBadgeVariant;
  children: ReactNode;
  /** 前置图标(12px),跟随徽章前景色 */
  icon?: ReactNode;
  /** 脉动状态点(进行中),与 icon 互斥使用 */
  pulse?: boolean;
  /** 类型徽章用:大写 + 字距 */
  uppercase?: boolean;
}

export function BlockBadge({ variant, children, icon, pulse, uppercase }: BlockBadgeProps) {
  const theme = useTheme();
  const [bg, fg] =
    variant === 'primary'
      ? [theme.color.primaryBg, theme.color.primary]
      : variant === 'success'
        ? [theme.color.successBg, theme.color.success]
        : variant === 'error'
          ? [theme.color.errorBg, theme.color.error]
          : variant === 'warning'
            ? [theme.color.warningBg, theme.color.warning]
            : variant === 'solidError'
              ? [theme.color.error, theme.color.textInverse]
              : [theme.color.fillSubtle, theme.color.textTertiary];

  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
        gap: ${theme.spacing[1]};
        font-size: ${theme.font.size.xs};
        font-weight: ${theme.font.weight.semibold};
        ${uppercase ? 'text-transform: uppercase; letter-spacing: 0.06em;' : ''}
        padding: 2px 8px;
        border-radius: ${theme.radius.full};
        background: ${bg};
        color: ${fg};
        flex-shrink: 0;
        white-space: nowrap;
      `}
    >
      {icon}
      {pulse && (
        <span
          css={css`
            width: 5px;
            height: 5px;
            border-radius: ${theme.radius.full};
            background: ${fg};
            animation: ${subtlePulse} 1.2s ease-in-out infinite;
          `}
        />
      )}
      {children}
    </span>
  );
}
