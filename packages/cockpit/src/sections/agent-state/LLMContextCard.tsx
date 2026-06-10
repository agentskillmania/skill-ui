/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Card, Statistic, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import {
  emptyTextStyle,
  metricTileStyle,
  metricsRowStyle,
  sectionLabelStyle,
  codeBlockStyle,
} from './styles.js';
import { CollapsibleCard, useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for LLMContextCard. */
export interface LLMContextCardProps {
  /** Last LLM request snapshot from daemon (strict mapping). */
  llm?: { messages: unknown[]; tools?: unknown[] } | null;
}

/** Title row style. */
const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

/**
 * Extract system prompt text from the first message in the LLM request.
 * Returns the content string if the first message has a string content field,
 * otherwise returns undefined.
 */
function extractSystemPrompt(messages: unknown[]): string | undefined {
  if (messages.length === 0) return undefined;
  const first = messages[0] as Record<string, unknown> | null | undefined;
  if (first == null) return undefined;
  const content = first.content;
  if (typeof content === 'string' && content.length > 0) return content;
  return undefined;
}

/**
 * LLMContextCard displays the last LLM request context:
 * message count, tool count, and system prompt preview.
 * System prompt is truncated by default, click to expand with
 * scrollable max-height.
 */
export function LLMContextCard({ llm }: LLMContextCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const promptToggle = useToggle(false);

  const isEmpty = !llm;
  const messageCount = llm?.messages?.length ?? 0;
  const toolCount = llm?.tools?.length ?? 0;
  const systemPrompt = llm ? extractSystemPrompt(llm.messages) : undefined;

  return (
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('agentState.llmContext.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('agentState.llmContext.none')}
        </div>
      ) : (
        <div>
          {/* Metrics row */}
          <div css={metricsRowStyle(theme)}>
            <div css={metricTileStyle(theme)}>
              <Statistic title={t('agentState.llmContext.messages')} value={messageCount} />
            </div>
            <div css={metricTileStyle(theme)}>
              <Statistic title={t('agentState.llmContext.tools')} value={toolCount} />
            </div>
          </div>

          {/* System prompt — truncated, click to expand */}
          {systemPrompt && (
            <div>
              <div css={sectionLabelStyle(theme)}>
                {t('agentState.llmContext.systemPrompt')}
              </div>
              <div
                css={codeBlockStyle(theme, promptToggle.value)}
                onClick={promptToggle.toggle}
                data-testid="system-prompt-toggle"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    promptToggle.toggle();
                  }
                }}
              >
                <pre>{systemPrompt}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
}
