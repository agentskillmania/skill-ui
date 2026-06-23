/** @jsxImportSource @emotion/react */
import { memo } from 'react';
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme, flexRow } from '@agentskillmania/skill-ui-theme';

import { NAMESPACE } from '../../locales/index.js';
import type { SkillStateData } from './types.js';
import { emptyTextStyle } from './styles.js';
import { CollapsibleCard, useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for ActiveSkillCard. */
export interface ActiveSkillCardProps {
  /** Skill state from colts AgentContext. */
  skillState?: SkillStateData | null;
}

/** Current skill name — highlighted. */
const skillNameStyle = (theme: ReturnType<typeof useTheme>) => css`
  color: ${theme.color.primary};
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.bold};
`;

/**
 * ActiveSkillCard displays the current active skill name.
 *
 * Note: skill instructions are no longer part of SkillState (they now live
 * in conversation history as load_skill tool results), so this card only
 * shows the current skill name plus an empty state when idle.
 */
export const ActiveSkillCard = memo(function ActiveSkillCard({ skillState }: ActiveSkillCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);

  const isEmpty = !skillState || skillState.current == null;

  return (
    <CollapsibleCard
      title={
        <div
          css={css`
            ${flexRow(theme, '1')};
            align-items: center;
          `}
        >
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.activeSkill.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>{t('agentState.activeSkill.none')}</div>
      ) : (
        <div>
          {/* Current skill name */}
          <div
            css={css`
              ${flexRow(theme, '1')};
              align-items: center;
            `}
          >
            <span css={skillNameStyle(theme)} data-testid="active-skill-name">
              {skillState!.current}
            </span>
          </div>
        </div>
      )}
    </CollapsibleCard>
  );
});
