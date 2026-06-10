/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme, flexRow } from '@agentskillmania/skill-ui-theme';

import { NAMESPACE } from '../../locales/index.js';
import type { SkillStateData } from './types.js';
import {
  emptyTextStyle,
  codeBlockStyle,
  stackFrameStyle,
  stackContainerStyle,
} from './styles.js';
import {
  CollapsibleCard,
  useToggle,
  SectionLabel,
  formatRelativeTime,
} from '@agentskillmania/skill-ui-shared';

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
 * ActiveSkillCard displays the current active skill name, call stack depth,
 * stack frames with relative timestamps, and loaded instructions.
 * Stack frames are shown directly. Instructions are truncated by default,
 * click to expand with scrollable max-height.
 */
export function ActiveSkillCard({ skillState }: ActiveSkillCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const instructionsToggle = useToggle(false);

  const isEmpty = !skillState || skillState.current == null;
  const stack = skillState?.stack ?? [];
  const depth = stack.length;

  return (
    <CollapsibleCard
      title={
        <div css={css`${flexRow(theme, '1')}; align-items: center;`}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.activeSkill.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('agentState.activeSkill.none')}
        </div>
      ) : (
        <div>
          {/* Current skill + depth badge */}
          <div css={css`${flexRow(theme, '1')}; align-items: center;`} style={{ marginBottom: theme.spacing[2] }}>
            <span css={skillNameStyle(theme)} data-testid="active-skill-name">
              {skillState!.current}
            </span>
            {depth > 0 && (
              <Tag
                style={{
                  fontSize: theme.font.size.xs,
                  padding: '0 4px',
                  lineHeight: '16px',
                  margin: 0,
                }}
              >
                {t('agentState.activeSkill.stackDepth', { count: depth })}
              </Tag>
            )}
          </div>

          {/* Stack frames — shown directly, no collapse */}
          {stack.length > 0 && (
            <div>
              <SectionLabel>Stack</SectionLabel>
              <div css={stackContainerStyle(theme)}>
                {stack.map((frame, i) => (
                  <div key={i} css={stackFrameStyle(theme)}>
                    <span style={{ color: theme.color.text, fontSize: theme.font.size.sm }}>
                      {frame.skillName}
                    </span>
                    <span style={{ color: theme.color.textTertiary, fontSize: theme.font.size.xs }}>
                      {formatRelativeTime(frame.loadedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loaded instructions — truncated, click to expand */}
          {skillState!.loadedInstructions && (
            <div>
              <SectionLabel>
                {t('agentState.activeSkill.instructions')}
              </SectionLabel>
              <div
                css={codeBlockStyle(theme, instructionsToggle.value)}
                onClick={instructionsToggle.toggle}
                data-testid="instructions-toggle"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    instructionsToggle.toggle();
                  }
                }}
              >
                <pre>{skillState!.loadedInstructions}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
}
