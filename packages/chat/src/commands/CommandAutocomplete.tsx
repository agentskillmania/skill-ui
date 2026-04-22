/**
 * Slash autocomplete dropdown component
 */
import { css } from '@emotion/react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ChatCommand } from '../types.js';
import { extractSearchTerm, filterCommands, groupCommands } from './commandUtils.js';

export interface CommandAutocompleteProps {
  /** All available commands */
  commands: ChatCommand[];
  /** Select command callback */
  onCommand: (command: ChatCommand) => void;
  /** Current input text */
  inputValue: string;
  /** Trigger character (default "/") */
  trigger?: string;
  /** Child element (wraps Dropdown) */
  children: React.ReactNode;
}

export function CommandAutocomplete({
  commands,
  onCommand,
  inputValue,
  trigger = '/',
  children,
}: CommandAutocompleteProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  // Auto-open dropdown when input starts with trigger
  useEffect(() => {
    if (inputValue.startsWith(trigger) && commands.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [inputValue, trigger, commands.length]);

  const filtered = useMemo(() => {
    const searchTerm = extractSearchTerm(inputValue, trigger);
    if (searchTerm === null) {
      return [];
    }
    return filterCommands(commands, searchTerm);
  }, [commands, inputValue, trigger]);

  const visible = inputValue.startsWith(trigger);

  const handleSelect = useCallback(
    (command: ChatCommand) => {
      onCommand(command);
      setOpen(false);
    },
    [onCommand]
  );

  const menuItems: MenuProps['items'] = useMemo(() => {
    if (filtered.length === 0) {
      return [
        {
          key: 'empty',
          disabled: true,
          label: '无匹配指令',
        },
      ];
    }

    const groups = groupCommands(filtered);
    const items: NonNullable<MenuProps['items']> = [];

    let groupIndex = 0;
    for (const [groupName, cmds] of groups) {
      if (groupIndex > 0) {
        items.push({ type: 'divider', key: `divider-${groupName}` });
      }

      items.push({
        key: `group-${groupName}`,
        type: 'group' as const,
        label: groupName,
        children: cmds.map((cmd) => ({
          key: cmd.id,
          icon: cmd.icon,
          label: (
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: ${theme.spacing[2]};
                min-width: 200px;
              `}
            >
              <span
                css={css`
                  font-weight: 500;
                  font-size: ${theme.font.size.sm};
                `}
              >
                {cmd.label}
              </span>
              {cmd.description && (
                <span
                  css={css`
                    color: ${theme.color.textTertiary};
                    font-size: ${theme.font.size.xs};
                    white-space: nowrap;
                  `}
                >
                  {cmd.description}
                </span>
              )}
            </div>
          ),
          onClick: () => handleSelect(cmd),
        })),
      });

      groupIndex++;
    }

    return items;
  }, [filtered, theme, handleSelect]);

  if (!visible || commands.length === 0) {
    return <>{children}</>;
  }

  return (
    <Dropdown
      open={open && visible}
      onOpenChange={setOpen}
      menu={{ items: menuItems }}
      trigger={[]}
      styles={{ root: { minWidth: 280 } }}
    >
      <div>{children}</div>
    </Dropdown>
  );
}
