/** @jsxImportSource @emotion/react */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Tag, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import { emptyTextStyle, tagRowStyle, titleRowStyle } from './styles.js';
import type { RunnerFeatureFlags } from './types.js';
import { useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for FeatureTagsCard. */
export interface FeatureTagsCardProps {
  /** Feature flags from runner config. */
  features?: RunnerFeatureFlags | null;
}

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing['1']};
  height: auto;
  line-height: 1;
`;

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
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.features.title')}
          </Typography.Text>
        </div>
      }
      extra={
        <Button
          type="text"
          css={toggleBtnStyle(theme)}
          onClick={collapsedToggle.toggle}
          data-testid="features-collapse-toggle"
          size="small"
        >
          {collapsedToggle.value ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </Button>
      }
    >
      {!collapsedToggle.value && (
        isEmpty ? (
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
        )
      )}
    </Card>
  );
}
