/** @jsxImportSource @emotion/react */
import { memo, useState } from 'react';
import { Card, Button, Popconfirm, Tooltip } from 'antd';
import { Trash2, Pencil, MessageCircle } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { ResourceAvatar } from '../shared/ResourceAvatar.js';
import type { SkillItem } from '../../types.js';

interface SkillCardProps {
  skill: SkillItem;
  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ellipsisStyle = {
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

export const SkillCard = memo(function SkillCard({ skill, onChat, onEdit, onDelete }: SkillCardProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      css={{
        position: 'relative',
        transition: `border-color ${theme.motion.duration.fast}, box-shadow ${theme.motion.duration.fast}`,
        '&:hover': {
          borderColor: theme.color.primary,
          boxShadow: `0 2px 8px ${theme.color.primaryBg}`,
        },
      }}
      actions={[
        <Button size="small" icon={<Pencil size={14} />} onClick={onEdit}>
          {t('edit')}
        </Button>,
        <Button type="primary" size="small" icon={<MessageCircle size={14} />} onClick={onChat}>
          {t('chat')}
        </Button>,
      ]}
    >
      <div
        css={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          opacity: hovered ? 1 : 0,
          transition: `opacity ${theme.motion.duration.fast}`,
        }}
      >
        <Popconfirm
          title={t('deleteConfirmSkill')}
          onConfirm={onDelete}
          okText={t('delete')}
          cancelText={t('cancel')}
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<Trash2 size={14} />} size="small" />
        </Popconfirm>
      </div>

      <Card.Meta
        avatar={<ResourceAvatar id={skill.id} name={skill.name} size={32} />}
        title={
          <Tooltip title={skill.name}>
            <div css={ellipsisStyle}>{skill.name}</div>
          </Tooltip>
        }
        description={
          <div css={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
            <Tooltip title={skill.description}>
              <div
                css={{
                  ...ellipsisStyle,
                  color: theme.color.textSecondary,
                  fontSize: theme.font.size.sm,
                }}
              >
                {skill.description}
              </div>
            </Tooltip>
          </div>
        }
      />
    </Card>
  );
});
