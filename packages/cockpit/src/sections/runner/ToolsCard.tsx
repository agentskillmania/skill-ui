/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Button, Card, Tabs, Typography } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../../locales/index.js';
import {
  emptyTextStyle,
  titleRowStyle,
  toolRowTopStyle,
  statusDotStyle,
  toolNameStyle,
  toolDescStyle,
  tabCountStyle,
} from './styles.js';
import type { RunnerToolInfo } from './types.js';
import { useToggle } from '@agentskillmania/skill-ui-shared';

/** Props for ToolsCard. */
export interface ToolsCardProps {
  /** Tool list from runner diagnostics. */
  tools?: RunnerToolInfo[] | null;
}

/** Toggle button style — minimal ghost button. */
const toggleBtnStyle = (theme: import('@agentskillmania/skill-ui-theme').Theme) => css`
  font-size: ${theme.font.size.xs};
  color: ${theme.color.textTertiary};
  padding: 0 ${theme.spacing[1]};
  height: auto;
  line-height: 1;
`;

/**
 * Three simplified tool categories.
 * - builtin: framework-provided core tools
 * - mcp: tools loaded via MCP servers
 * - custom: everything else (user-configured, session, todolist, a2ui, extra, etc.)
 */
type ToolCategory = 'builtin' | 'mcp' | 'custom';

/** Original type → simplified category mapping. */
function toCategory(type: string | undefined): ToolCategory {
  if (type === 'builtin') return 'builtin';
  if (type === 'mcp') return 'mcp';
  return 'custom';
}

/** Category → i18n label key. */
const CATEGORY_I18N_KEYS: Record<ToolCategory, string> = {
  builtin: 'runner.tools.typeBuiltin',
  mcp: 'runner.tools.typeMcp',
  custom: 'runner.tools.typeCustom',
};

/** Display order for categories. */
const CATEGORY_ORDER: ToolCategory[] = ['builtin', 'mcp', 'custom'];

/**
 * Group tools into three simplified categories.
 */
function groupByCategory(tools: RunnerToolInfo[]): Map<ToolCategory, RunnerToolInfo[]> {
  const groups = new Map<ToolCategory, RunnerToolInfo[]>();
  for (const tool of tools) {
    const cat = toCategory(tool.type);
    const list = groups.get(cat) ?? [];
    list.push(tool);
    groups.set(cat, list);
  }
  // Sort by predefined order
  const sorted = new Map<ToolCategory, RunnerToolInfo[]>();
  for (const key of CATEGORY_ORDER) {
    const group = groups.get(key);
    if (group) sorted.set(key, group);
  }
  return sorted;
}

/**
 * ToolsCard displays available tools with tab-based category filtering.
 * Three tabs: Builtin / MCP / Custom. No "All" tab.
 * Each tool is a two-line row: name with status dot on top,
 * description truncated below. Click a row to expand full description
 * with a primary border highlight (same pattern as EventLog).
 * Uses antd Tabs with size="small" for compact layout.
 */
export function ToolsCard({ tools }: ToolsCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const [activeTab, setActiveTab] = useState<string>('builtin');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const isEmpty = !tools || tools.length === 0;

  const groups = useMemo(
    () => (isEmpty ? new Map<ToolCategory, RunnerToolInfo[]>() : groupByCategory(tools!)),
    [tools, isEmpty],
  );

  const toggleExpand = (name: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  /** Filtered tools based on active tab. */
  const filteredTools = useMemo(() => {
    return groups.get(activeTab as ToolCategory) ?? [];
  }, [activeTab, groups]);

  /** Build tab items: one per category, no "All". */
  const tabItems = useMemo(() => {
    return CATEGORY_ORDER
      .filter((cat) => groups.has(cat))
      .map((cat) => ({
        key: cat,
        label: (
          <span>
            {t(CATEGORY_I18N_KEYS[cat])}
            <span css={tabCountStyle(theme)}>{groups.get(cat)!.length}</span>
          </span>
        ),
      }));
  }, [groups, t, theme]);

  /** Default to first available category tab. */
  const effectiveTab = groups.has(activeTab as ToolCategory)
    ? activeTab
    : (tabItems[0]?.key ?? 'builtin');

  return (
    <Card
      size="small"
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.tools.title')}
          </Typography.Text>
        </div>
      }
      extra={
        !isEmpty ? (
          <Button
            type="text"
            css={toggleBtnStyle(theme)}
            onClick={collapsedToggle.toggle}
            data-testid="tools-collapse-toggle"
            size="small"
          >
            {collapsedToggle.value ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </Button>
        ) : undefined
      }
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>
          {t('runner.tools.empty')}
        </div>
      ) : !collapsedToggle.value ? (
        <>
          <Tabs
            size="small"
            activeKey={effectiveTab}
            onChange={setActiveTab}
            items={tabItems}
            data-testid="tools-type-tabs"
          />
          <div css={css`padding: ${theme.spacing[1]} 0;`}>
            {(effectiveTab === activeTab ? filteredTools : (groups.get(effectiveTab as ToolCategory) ?? [])).map((tool) => {
              const isEnabled = tool.enabled !== false;
              const isExpanded = expandedTools.has(tool.name);
              return (
                <div
                  key={tool.name}
                  css={css`
                    padding: ${theme.spacing[1]} ${theme.spacing[2]};
                    cursor: pointer;
                    border: 1px solid ${isExpanded ? theme.color.primary : 'transparent'};
                    border-radius: ${theme.radius.md};
                    transition: border-color 0.15s, background 0.12s;
                    &:hover {
                      background: ${theme.color.fillSecondary};
                    }
                  `}
                  onClick={() => toggleExpand(tool.name)}
                  data-testid={`tool-item-${tool.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(tool.name);
                    }
                  }}
                >
                  <div css={toolRowTopStyle(theme)}>
                    <div
                      css={statusDotStyle(theme, isEnabled)}
                      data-testid={`tool-status-${tool.name}`}
                    />
                    <span
                      css={toolNameStyle(theme, isEnabled)}
                      data-testid={`tool-name-${tool.name}`}
                    >
                      {tool.name}
                    </span>
                  </div>
                  {tool.description && (
                    <div
                      css={toolDescStyle(theme, isExpanded)}
                      data-testid={`tool-desc-${tool.name}`}
                    >
                      {tool.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </Card>
  );
}
