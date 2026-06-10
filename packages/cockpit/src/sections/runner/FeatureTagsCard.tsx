/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Card, Tag, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import { emptyTextStyle, tagRowStyle, titleRowStyle } from './styles.js';
import type { RunnerFeatureFlags } from './types.js';
import { CollapsibleCard, useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for FeatureTagsCard. */
export interface FeatureTagsCardProps {
  /** Feature flags from runner config. */
  features?: RunnerFeatureFlags | null;
}

/** Feature key → i18n label key mapping. */
const FEATURE_KEYS: Array<{ key: keyof RunnerFeatureFlags; labelKey: string }> = [
  { key: 'sandbox', labelKey: 'runner.features.sandbox' },
  { key: 'thinkingEnabled', labelKey: 'runner.features.thinking' },
  { key: 'enablePromptThinking', labelKey: 'runner.features.promptThinking' },
  { key: 'a2uiEnabled', labelKey: 'runner.features.a2ui' },
  { key: 'compressorEnabled', labelKey: 'runner.features.compressor' },
  { key: 'enableSession', labelKey: 'runner.features.session' },
  { key: 'enableTodolist', labelKey: 'runner.features.todolist' },
  { key: 'enableCommands', labelKey: 'runner.features.commands' },
];

/**
 * FeatureTagsCard displays runner feature toggles as a row of colored tags.
 * Green = enabled, Gray = disabled. Collapsible via top-right toggle.
 */
export function FeatureTagsCard({ features }: FeatureTagsCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);

  const isEmpty = !features;

  return (
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.features.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>—</div>
      ) : (
        <div css={tagRowStyle(theme)}>
          {FEATURE_KEYS.map(({ key, labelKey }) => (
            <Tag
              key={key}
              color={features[key] ? 'success' : 'default'}
              data-testid={`feature-tag-${key}`}
            >
              {t(labelKey)}
            </Tag>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
}
