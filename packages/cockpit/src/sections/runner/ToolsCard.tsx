/** @jsxImportSource @emotion/react */
import { emptyTextStyle } from '@agentskillmania/skill-ui-shared';
import { CollapsibleCard, useToggle, StatusDot } from '@agentskillmania/skill-ui-shared';
import { useTheme, interactiveRow } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Tabs, Typography } from 'antd';
import { memo } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  titleRowStyle,
  toolRowTopStyle,
  toolNameStyle,
  toolDescStyle,
  tabCountStyle,
} from './styles.js';
import type { RunnerToolInfo } from './types.js';
import { NAMESPACE } from '../../locales/index.js';

/** Props for ToolsCard. */
export interface ToolsCardProps {
  /** Tool list from runner diagnostics. */
  tools?: RunnerToolInfo[] | null;
}

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
 * description truncated below. Uses shared interactiveRow for hover
 * and StatusDot for the enabled indicator.
 * Uses antd Tabs with size="small" for compact layout.
 */
export const ToolsCard = memo(function ToolsCard({ tools }: ToolsCardProps) {
  const { t } = useTranslation(NAMESPACE);
  const theme = useTheme();
  const collapsedToggle = useToggle(false);
  const [activeTab, setActiveTab] = useState<string>('builtin');

  const isEmpty = !tools || tools.length === 0;

  const groups = useMemo(
    () => (isEmpty ? new Map<ToolCategory, RunnerToolInfo[]>() : groupByCategory(tools!)),
    [tools, isEmpty]
  );

  /** Filtered tools based on active tab. */
  const filteredTools = useMemo(() => {
    return groups.get(activeTab as ToolCategory) ?? [];
  }, [activeTab, groups]);

  /** Build tab items: one per category, no "All". */
  const tabItems = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => groups.has(cat)).map((cat) => ({
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
    <CollapsibleCard
      title={
        <div css={titleRowStyle(theme)}>
          <Typography.Text strong style={{ fontSize: theme.font.size.sm }}>
            {t('runner.tools.title')}
          </Typography.Text>
        </div>
      }
      collapsed={collapsedToggle.value}
      onCollapseChange={(v) => collapsedToggle.set(v)}
    >
      {isEmpty ? (
        <div css={emptyTextStyle(theme)}>{t('runner.tools.empty')}</div>
      ) : (
        <>
          <Tabs
            size="small"
            activeKey={effectiveTab}
            onChange={setActiveTab}
            items={tabItems}
            data-testid="tools-type-tabs"
          />
          <div
            css={css`
              padding: ${theme.spacing[1]} 0;
            `}
          >
            {(effectiveTab === activeTab
              ? filteredTools
              : (groups.get(effectiveTab as ToolCategory) ?? [])
            ).map((tool) => {
              const isEnabled = tool.enabled !== false;
              return (
                <div
                  key={tool.name}
                  css={interactiveRow(theme)}
                  data-testid={`tool-item-${tool.name}`}
                >
                  <div css={toolRowTopStyle(theme)}>
                    <StatusDot enabled={isEnabled} />
                    <span
                      css={toolNameStyle(theme, isEnabled)}
                      data-testid={`tool-name-${tool.name}`}
                    >
                      {tool.name}
                    </span>
                  </div>
                  {tool.description && (
                    <div css={toolDescStyle(theme, false)} data-testid={`tool-desc-${tool.name}`}>
                      {tool.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </CollapsibleCard>
  );
});
