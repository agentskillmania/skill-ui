/** @jsxImportSource @emotion/react */
/**
 * EventFilterBar — toggle tags for filtering events by category
 */
import { memo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { EventCategory } from './types.js';
import { ALL_CATEGORIES, getCategoryIcon } from './eventCategory.js';
import { NAMESPACE } from '../../locales/index.js';

export interface EventFilterBarProps {
  activeCategories: Set<EventCategory>;
  onToggle: (category: EventCategory) => void;
}

export const EventFilterBar = memo(function EventFilterBar({ activeCategories, onToggle }: EventFilterBarProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  return (
    <div
      css={css`
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing[1]};
        padding-bottom: ${theme.spacing[2]};
        border-bottom: 1px solid ${theme.color.border};
      `}
    >
      {ALL_CATEGORIES.map((cat) => {
        const Icon = getCategoryIcon(cat);
        const isActive = activeCategories.has(cat);
        return (
          <Tag
            key={cat}
            onClick={() => onToggle(cat)}
            css={css`
              cursor: pointer;
              user-select: none;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              opacity: ${isActive ? 1 : 0.5};
              &:hover {
                opacity: 1;
              }
            `}
          >
            <Icon size={10} />
            {t(`eventLogPanel.${cat}`)}
          </Tag>
        );
      })}
    </div>
  );
});
