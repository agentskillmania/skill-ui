/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Tag, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import type { SkillStateData } from './types.js';
import {
  emptyTextStyle,
  codeBlockStyle,
  stackFrameStyle,
  stackContainerStyle,
  sectionLabelStyle,
} from './styles.js';
import { useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for ActiveSkillCard. */
export interface ActiveSkillCardProps {
  /** Skill state from colts AgentContext. */
  skillState?: SkillStateData | null;
}

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing[1]};
  height: auto;
  line-height: 1;
`;

/** Title row style. */
const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/** Current skill name — highlighted. */
const skillNameStyle = (theme: Theme) => css`
  color: ${theme.color.primary};
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.bold};
`;

/**
 * Format a unix timestamp (ms) to relative time string.
 * Returns "Xs", "Xm", "Xh" relative to now.
 */
function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp == null) return '';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

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
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.activeSkill.title')}
          </Typography.Text>
        </div>
      }
      extra={
        !isEmpty ? (
          <Button
            type="text"
            css={toggleBtnStyle(theme)}
            onClick={collapsedToggle.toggle}
            data-testid="active-skill-collapse"
            size="small"
          >
            {collapsedToggle.value ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </Button>
        ) : undefined
      }
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('agentState.activeSkill.none')}
        </div>
      ) : !collapsedToggle.value ? (
        <div>
          {/* Current skill + depth badge */}
          <div css={titleRowStyle(theme)} style={{ marginBottom: theme.spacing[2] }}>
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
              <div css={sectionLabelStyle(theme)}>Stack</div>
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
              <div css={sectionLabelStyle(theme)}>
                {t('agentState.activeSkill.instructions')}
              </div>
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
      ) : null}
    </Card>
  );
}
