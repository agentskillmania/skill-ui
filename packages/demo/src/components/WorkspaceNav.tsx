/**
 * Titlebar center slot — home button + workspace breadcrumb
 */
import { css } from '@emotion/react';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { useTheme } from '@agentskillmania/skill-ui-theme';

interface WorkspaceNavProps {
  workspaceName: string;
  onGoHome: () => void;
  workspaces?: Array<{ id: string; name: string }>;
  onSwitchWorkspace?: (id: string) => void;
}

export function WorkspaceNav({
  workspaceName,
  onGoHome,
  workspaces = [],
  onSwitchWorkspace,
}: WorkspaceNavProps) {
  const theme = useTheme();

  const menuItems: MenuProps['items'] = [
    ...workspaces.map((ws) => ({
      key: ws.id,
      label: ws.name,
    })),
    { type: 'divider' as const },
    {
      key: '__open',
      label: '+ Open Directory...',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    if (info.key === '__open') return;
    onSwitchWorkspace?.(info.key);
  };

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[1]};
      `}
    >
      <Button
        type="text"
        size="small"
        onClick={onGoHome}
        css={css`
          color: ${theme.color.textSecondary};
          padding: 0 ${theme.spacing[1]};
          font-size: ${theme.font.size.base};
          line-height: 1;
        `}
      >
        🏠
      </Button>
      <span
        css={css`
          color: ${theme.color.textQuaternary};
          font-size: ${theme.font.size.xs};
        `}
      >
        /
      </span>
      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
        <span
          css={css`
            color: ${theme.color.primary};
            font-size: ${theme.font.size.sm};
            cursor: pointer;
            padding: 1px ${theme.spacing[2]};
            border-radius: ${theme.radius.sm};
            border: 1px solid ${theme.color.border};
            background: ${theme.color.bgContainer};
            user-select: none;
          `}
        >
          {workspaceName} ▾
        </span>
      </Dropdown>
    </div>
  );
}
