/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import {
  emptyTextStyle,
  titleRowStyle,
  toolItemStyle,
  itemNameStyle,
  sourcePathStyle,
  collapseHeaderStyle,
  descriptionStyle,
} from './styles.js';
import type { RunnerSkillInfo } from './types.js';
import { CollapsibleCard, useToggle, ExpandableItem } from '@agentskillmania/skill-ui-shared';

/** Props for SkillsCard. */
export interface SkillsCardProps {
  /** Skill list from runner diagnostics. */
  skills?: RunnerSkillInfo[] | null;
}

/**
 * SkillsCard displays loaded skills as a flat collapsible list.
 * The entire card body can be collapsed via the top-right toggle.
 * Uses ExpandableItem for per-skill expand/collapse with description.
 */
export function SkillsCard({ skills }: SkillsCardProps) {
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
            <div key={skill.name}>
              <ExpandableItem
                expandable={!!skill.description}
                defaultExpanded={false}
                renderSummary={({ expanded, toggle }) => (
                  <div css={toolItemStyle(theme)} data-testid={`skill-item-${skill.name}`}>
                    <div
                      css={collapseHeaderStyle(theme)}
                      onClick={toggle}
                      data-testid={`skill-toggle-${skill.name}`}
                    >
                      {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      <span css={itemNameStyle(theme)}>{skill.name}</span>
                    </div>
                    {skill.source && (
                      <span css={sourcePathStyle(theme)} title={skill.source}>
                        {skill.source}
                      </span>
                    )}
                  </div>
                )}
                renderDetail={() =>
                  skill.description ? (
                    <div css={descriptionStyle(theme)}>{skill.description}</div>
                  ) : null
                }
              />
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
}
