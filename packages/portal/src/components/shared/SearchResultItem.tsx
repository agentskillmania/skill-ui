/** @jsxImportSource @emotion/react */
import { memo } from 'react';
import { Button, Tooltip } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import { ResourceAvatar } from './ResourceAvatar.js';
import { HighlightText } from './HighlightText.js';
import type { SearchResultItemData } from '../../types.js';

interface SearchResultItemProps {
  item: SearchResultItemData;
  query: string;
  onEdit?: () => void;
}

export const SearchResultItem = memo(function SearchResultItem({ item, query, onEdit }: SearchResultItemProps) {
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
      {onEdit && (
        <Tooltip title={item.type === 'session' ? '删除' : '编辑'}>
          <Button
            type="text"
            size="small"
            icon={item.type === 'session' ? <Trash2 size={14} /> : <Pencil size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          />
        </Tooltip>
      )}
    </div>
  );
});
