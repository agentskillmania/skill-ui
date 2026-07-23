/** @jsxImportSource @emotion/react */
import { FONT_DISPLAY } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { keyframes } from '@emotion/react';
import { AutoComplete, Input, Button, Tooltip } from 'antd';
import { Search, Github } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SearchResults, SearchResultType } from '../../types.js';
import { SearchResultItem } from '../SearchResultItem/index.js';

interface PortalHeaderProps {
  /** Controlled search query value */
  query: string;
  /** Callback when query changes */
  onQueryChange: (query: string) => void;
  results: SearchResults;
  onSearch: (query: string) => void;
  onSelect: (type: SearchResultType, id: string) => void;
  onEdit: (type: SearchResultType, id: string) => void;
  githubUrl?: string;
}

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

export const PortalHeader = memo(function PortalHeader({
  query,
  onQueryChange,
  results,
  onSearch,
  onSelect,
  onEdit,
  githubUrl,
}: PortalHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');

  const options = [
    ...(results.skills.length > 0
      ? [
          {
            label: (
              <div css={{ fontSize: 12, color: theme.color.textTertiary, padding: '4px 12px' }}>
                {t('skills')}
              </div>
            ),
            options: results.skills.map((item) => ({
              value: `skill:${item.id}`,
              label: (
                <SearchResultItem
                  item={item}
                  query={query}
                  onEdit={() => onEdit('skill', item.id)}
                />
              ),
              data: { type: 'skill' as SearchResultType, id: item.id },
            })),
          },
        ]
      : []),
    ...(results.agents.length > 0
      ? [
          {
            label: (
              <div css={{ fontSize: 12, color: theme.color.textTertiary, padding: '4px 12px' }}>
                {t('agents')}
              </div>
            ),
            options: results.agents.map((item) => ({
              value: `agent:${item.id}`,
              label: (
                <SearchResultItem
                  item={item}
                  query={query}
                  onEdit={() => onEdit('agent', item.id)}
                />
              ),
              data: { type: 'agent' as SearchResultType, id: item.id },
            })),
          },
        ]
      : []),
    ...(results.sessions.length > 0
      ? [
          {
            label: (
              <div css={{ fontSize: 12, color: theme.color.textTertiary, padding: '4px 12px' }}>
                {t('sessions')}
              </div>
            ),
            options: results.sessions.map((item) => ({
              value: `session:${item.id}`,
              label: (
                <SearchResultItem
                  item={item}
                  query={query}
                  onEdit={() => onEdit('session', item.id)}
                />
              ),
              data: { type: 'session' as SearchResultType, id: item.id },
            })),
          },
        ]
      : []),
  ];

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <div css={{ marginBottom: theme.spacing[6] }}>
      <div
        css={{
          position: 'relative',
          textAlign: 'center',
          marginBottom: theme.spacing[4],
        }}
      >
        {githubUrl && (
          <Tooltip title="GitHub">
            <Button
              type="text"
              size="small"
              icon={<Github size={14} />}
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              css={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}
            />
          </Tooltip>
        )}
        <div
          css={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: 2,
            marginBottom: theme.spacing[2],
            userSelect: 'none',
            cursor: 'default',
            display: 'inline-block',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'scale(1.04)',
            },
            '&:hover > span:last-of-type': {
              animation: `${gradientFlow} 1.5s linear infinite`,
            },
          }}
        >
          <span css={{ color: theme.color.text }}>Skill</span>
          <span
            css={{
              background: `linear-gradient(90deg, ${theme.color.purple}, ${theme.color.primary}, ${theme.color.purple})`,
              backgroundSize: '200% 100%',
              backgroundPosition: '0% 50%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Studio
          </span>
        </div>
        <div css={{ fontSize: theme.font.size.sm, color: theme.color.textTertiary }}>
          {t('subtitle')}
        </div>
      </div>

      <AutoComplete
        variant="borderless"
        value={query}
        onChange={(v) => onQueryChange(v || '')}
        onSelect={(_, option) => {
          const opt = option as { data?: { type: SearchResultType; id: string } };
          if (opt?.data) {
            onSelect(opt.data.type, opt.data.id);
          }
        }}
        options={options}
        css={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'block' }}
      >
        <Input
          placeholder={t('searchPlaceholder')}
          allowClear
          prefix={<Search size={16} />}
          size="large"
          onPressEnter={handleSearch}
        />
      </AutoComplete>
    </div>
  );
});
