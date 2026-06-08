/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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

/** Props for SkillsCard. */
export interface SkillsCardProps {
  /** Skill list from runner diagnostics. */
  skills?: RunnerSkillInfo[] | null;
}

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: import('@agentskillmania/skill-ui-theme').Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing['1']};
  height: auto;
  line-height: 1;
`;

/**
 * SkillsCard displays loaded skills as a flat collapsible list.
 * The entire card body can be collapsed via the top-right toggle.
 * Expanded items also show description.
 */
export function SkillsCard({ skills }: SkillsCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  const isEmpty = !skills || skills.length === 0;

  const toggleSkill = (name: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.skills.title')}
          </Typography.Text>
        </div>
      }
      extra={
        <Button
          type="text"
          css={toggleBtnStyle(theme)}
          onClick={() => setCollapsed((prev) => !prev)}
          data-testid="skills-collapse-toggle"
          size="small"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </Button>
      }
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('runner.skills.empty')}
        </div>
      ) : !collapsed ? (
        <div>
          {skills!.map((skill) => {
            const isExpanded = expandedSkills.has(skill.name);
            return (
              <div key={skill.name}>
                <div
                  css={toolItemStyle(theme)}
                  data-testid={`skill-item-${skill.name}`}
                >
                  <div
                    css={collapseHeaderStyle(theme)}
                    onClick={() => toggleSkill(skill.name)}
                    data-testid={`skill-toggle-${skill.name}`}
                  >
                    {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    <span css={itemNameStyle(theme)}>{skill.name}</span>
                  </div>
                  {skill.source && (
                    <span css={sourcePathStyle(theme)} title={skill.source}>
                      {skill.source}
                    </span>
                  )}
                </div>
                {isExpanded && skill.description && (
                  <div css={descriptionStyle(theme)}>
                    {skill.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
