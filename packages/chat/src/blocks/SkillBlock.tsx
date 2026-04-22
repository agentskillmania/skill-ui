/**
 * Skill execution block
 */
import { css, keyframes } from '@emotion/react';
import { Sparkles, CheckCircle, XCircle, Loader } from 'lucide-react';
import type { BlockProps, SkillBlockMetadata } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { BlockCard } from './BlockCard.js';
import type { Theme } from '@agentskillmania/skill-ui-theme';

/** Spin animation */
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const spinningLoader = (
  <Loader
    size={14}
    css={css`
      animation: ${spin} 1s linear infinite;
    `}
  />
);

/** Return display info based on phase */
function getPhaseDisplay(
  meta: SkillBlockMetadata | undefined,
  status: string,
  theme: Theme
): { title: string; tag?: string; icon: React.ReactNode; accentColor: string } {
  const name = meta?.skillName ?? '技能';
  const skillAccent = theme.blockColor.skill.text;

  if (status === 'error') {
    return {
      title: `${name} 执行失败`,
      tag: '失败',
      icon: <XCircle size={14} />,
      accentColor: theme.color.error,
    };
  }

  switch (meta?.phase) {
    case 'loading':
      return {
        title: `加载技能: ${name}...`,
        tag: '加载中',
        icon: spinningLoader,
        accentColor: skillAccent,
      };
    case 'loaded':
      return {
        title: `${name}（${meta.tokenCount ?? 0} tokens）`,
        tag: '已加载',
        icon: <Sparkles size={14} />,
        accentColor: skillAccent,
      };
    case 'executing':
      return {
        title: `执行技能: ${name}`,
        tag: meta?.task ?? '执行中',
        icon: spinningLoader,
        accentColor: skillAccent,
      };
    case 'completed':
      return {
        title: `${name} 完成`,
        icon: <CheckCircle size={14} />,
        accentColor: theme.color.success,
      };
    default:
      return {
        title: name,
        icon: <Sparkles size={14} />,
        accentColor: skillAccent,
      };
  }
}

export function SkillBlock({ block }: BlockProps) {
  const theme = useTheme();
  const meta = block.metadata as SkillBlockMetadata | undefined;
  const { title, tag, icon, accentColor } = getPhaseDisplay(meta, block.status, theme);

  return (
    <BlockCard icon={icon} title={title} accentColor={accentColor} tag={tag}>
      {block.content && (
        <div
          css={css`
            font-size: ${theme.font.size.sm};
            color: ${theme.color.textSecondary};
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.6;
          `}
        >
          {block.content}
        </div>
      )}
    </BlockCard>
  );
}
