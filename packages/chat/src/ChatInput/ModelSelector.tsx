/**
 * Model selector dropdown for the chat input toolbar.
 *
 * Click-triggered: focus returns to the trigger button, which is fine — this
 * is not a type-to-filter scenario, so no focus-preservation tricks needed
 * (unlike CommandAutocomplete).
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ChevronDown } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { ChatModelGroup, ChatModelOption } from '../types.js';

export interface ModelSelectorProps {
  /** Model groups (ordered) */
  groups: ChatModelGroup[];
  /** Currently selected model */
  selectedModel?: ChatModelOption;
  /** Select model callback */
  onChange: (model: ChatModelOption) => void;
  /** Disabled */
  disabled?: boolean;
}

export const ModelSelector = memo(function ModelSelector({
  groups,
  selectedModel,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);

  const handleSelect = useCallback((model: ChatModelOption) => onChange(model), [onChange]);

  // Show group headers only when there's more than one group, or the single
  // group carries an explicit label; otherwise render a flat list.
  const showGroupHeaders = groups.length > 1 || (groups.length === 1 && Boolean(groups[0].label));

  const items: MenuProps['items'] = useMemo(() => {
    const result: NonNullable<MenuProps['items']> = [];
    if (!showGroupHeaders) {
      groups.forEach((g) => {
        g.models.forEach((m) => {
          result.push({ key: m.id, label: m.label ?? m.id, onClick: () => handleSelect(m) });
        });
      });
      return result;
    }
    groups.forEach((group, gi) => {
      if (gi > 0) {
        result.push({ type: 'divider', key: `divider-${group.key}` });
      }
      result.push({
        key: `group-${group.key}`,
        type: 'group',
        label: group.label ?? group.key,
        children: group.models.map((m) => ({
          key: m.id,
          label: m.label ?? m.id,
          onClick: () => handleSelect(m),
        })),
      });
    });
    return result;
  }, [groups, showGroupHeaders, handleSelect]);

  const label = selectedModel?.label ?? selectedModel?.id ?? t('chatInput.model');

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: selectedModel ? [selectedModel.id] : [],
        style: { maxHeight: '50vh', overflowY: 'auto', minWidth: 180 },
      }}
      trigger={['click']}
      disabled={disabled}
    >
      <button
        type="button"
        data-testid="model-selector"
        disabled={disabled}
        css={css`
          display: inline-flex;
          align-items: center;
          gap: ${theme.spacing[1]};
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.full};
          background: ${theme.color.bgContainer};
          color: ${theme.color.text};
          font-size: ${theme.font.size.sm};
          line-height: 1;
          cursor: pointer;
          transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};

          &:hover:not(:disabled) {
            border-color: ${theme.color.primary};
            color: ${theme.color.primary};
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      >
        <span
          css={css`
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {label}
        </span>
        <ChevronDown size={14} />
      </button>
    </Dropdown>
  );
});
