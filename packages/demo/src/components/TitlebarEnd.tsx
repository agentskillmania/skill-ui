/**
 * Titlebar end slot — theme toggle + settings
 */
import { css } from '@emotion/react';
import { Switch } from 'antd';
import { useTheme } from '@agentskillmania/skill-ui-theme';

interface TitlebarEndProps {
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
}

export function TitlebarEnd({ isDark, onToggleTheme }: TitlebarEndProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
      `}
    >
      <Switch
        checked={isDark}
        onChange={onToggleTheme}
        size="small"
        checkedChildren="🌙"
        unCheckedChildren="☀️"
      />
    </div>
  );
}
