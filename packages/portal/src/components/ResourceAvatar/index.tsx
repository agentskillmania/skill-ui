/** @jsxImportSource @emotion/react */
import { getAvatarColor, getInitial } from '@agentskillmania/skill-ui-shared';
import { Avatar } from 'antd';

interface ResourceAvatarProps {
  id: string;
  name: string;
  size?: number;
}

export function ResourceAvatar({ id, name, size = 40 }: ResourceAvatarProps) {
  const color = getAvatarColor(id);
  return (
    <Avatar
      style={{
        backgroundColor: color.bg,
        color: color.text,
        fontSize: size * 0.5,
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {getInitial(name)}
    </Avatar>
  );
}
