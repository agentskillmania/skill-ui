/** @jsxImportSource @emotion/react */
import { Button, Popconfirm, Tooltip } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SearchResultItemData } from '../../types.js';
import { HighlightText } from '../HighlightText/index.js';
import { ResourceAvatar } from '../ResourceAvatar/index.js';

interface SearchResultItemProps {
  item: SearchResultItemData;
  query: string;
  onEdit?: () => void;
}

export const SearchResultItem = memo(function SearchResultItem({
  item,
  query,
  onEdit,
}: SearchResultItemProps) {
  const { t } = useTranslation('skill-ui-portal');
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
      }}
    >
      <div css={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ResourceAvatar id={item.id} name={item.title} size={20} />
        <div css={{ lineHeight: 1.3 }}>
          <div css={{ fontSize: 13 }}>
            <HighlightText text={item.title} query={query} />
          </div>
          {item.subtitle && (
            <div css={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>
              {item.subtitle}
            </div>
          )}
        </div>
      </div>
      {onEdit &&
        (item.type === 'session' ? (
          // 删除与包内其他路径一致：Popconfirm 二次确认后再调回调
          //（onEdit 回调对 session 类型实为删除，见 Portal.tsx fallback 分支）
          <Popconfirm
            title={t('deleteConfirmSession')}
            onConfirm={onEdit}
            okText={t('delete')}
            cancelText={t('cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        ) : (
          <Tooltip title={t('edit')}>
            <Button
              type="text"
              size="small"
              icon={<Pencil size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            />
          </Tooltip>
        ))}
    </div>
  );
});
