/** @jsxImportSource @emotion/react */
import { memo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import { emptyTextStyle, titleRowStyle, itemNameStyle, sourcePathStyle } from './styles.js';
import type { RunnerSkillInfo } from './types.js';
import { CollapsibleCard, useToggle, ExpandableRow } from '@agentskillmania/skill-ui-shared';

/** Props for SkillsCard. */
export interface SkillsCardProps {
  /** Skill list from runner diagnostics. */
  skills?: RunnerSkillInfo[] | null;
}

/**
 * SkillsCard displays loaded skills as a flat collapsible list.
 * Uses ExpandableRow for per-skill expand/collapse with chevron indicator.
 */
export const SkillsCard = memo(function SkillsCard({ skills }: SkillsCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);

  const isEmpty = !skills || skills.length === 0;

  return (
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.skills.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>{t('runner.skills.empty')}</div>
      ) : (
        <div>
          {skills!.map((skill) => (
            <ExpandableRow
              key={skill.name}
              expandable={!!skill.description}
              defaultExpanded={false}
              showChevron
              renderSummary={() => (
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                  data-testid={`skill-item-${skill.name}`}
                >
                  <span css={itemNameStyle(theme)}>{skill.name}</span>
                  {skill.source && (
                    <span css={sourcePathStyle(theme)} title={skill.source}>
                      {skill.source}
                    </span>
                  )}
                </div>
              )}
              renderDetail={skill.description ? () => <div>{skill.description}</div> : undefined}
            />
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
});
