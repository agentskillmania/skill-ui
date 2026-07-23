/** @jsxImportSource @emotion/react */
/**
 * EventTypeTag — fixed-width color tag for event type labels
 */
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { Tag } from 'antd';

import { getEventColor } from './eventCategory.js';
import type { CockpitEventType } from './types.js';

export interface EventTypeTagProps {
  type: CockpitEventType;
  theme: Theme;
}

export function EventTypeTag({ type, theme }: EventTypeTagProps) {
  const colors = getEventColor(type, theme);
  return (
    <Tag
      style={{
        background: colors.bg,
        color: colors.text,
        border: 'none',
        fontSize: 10,
        fontWeight: 600,
        margin: 0,
        flexShrink: 0,
        width: 100,
        textAlign: 'center',
      }}
    >
      {type}
    </Tag>
  );
}
