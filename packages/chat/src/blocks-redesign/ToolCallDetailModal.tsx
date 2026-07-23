/**
 * Tool call detail modal — shows input/output with JSON tree and raw Monaco views
 */
import { css } from '@emotion/react';
import JsonViewPkg from '@microlink/react-json-view';
import EditorPkg from '@monaco-editor/react';
import { Modal, Tabs, Input } from 'antd';
import { Wrench, X } from 'lucide-react';
import { useState, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JsonView = JsonViewPkg as unknown as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Editor = EditorPkg as unknown as React.ComponentType<any>;
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';

import { getToolColorKey } from './toolColorUtils.js';
import { NAMESPACE } from '../locales/index.js';

export interface ToolCallDetailModalProps {
  open: boolean;
  toolName: string;
  toolType?: string;
  args?: string;
  result?: string;
  onClose: () => void;
}

/** Try parse JSON, return { data, isJson } */
function tryParseJson(raw: string | undefined): { data: unknown; isJson: boolean } {
  if (!raw) return { data: null, isJson: false };
  try {
    const parsed = JSON.parse(raw);
    return { data: parsed, isJson: true };
  } catch {
    return { data: raw, isJson: false };
  }
}

/** Build react-json-view custom theme from skill-ui-theme tokens */
function buildJsonViewTheme(theme: ReturnType<typeof useTheme>) {
  return {
    base00: theme.color.bgContainer,
    base01: theme.color.fill,
    base02: theme.color.border,
    base03: theme.color.textTertiary,
    base04: theme.color.textSecondary,
    base05: theme.color.text,
    base06: theme.color.primary,
    base07: theme.color.success,
    base08: theme.color.error,
    base09: theme.color.warning,
    base0A: theme.color.info,
    base0B: theme.color.success,
    base0C: theme.color.primary,
    base0D: theme.color.primary,
    base0E: theme.color.info,
    base0F: theme.color.textSecondary,
  };
}

export function ToolCallDetailModal({
  open,
  toolName,
  toolType,
  args,
  result,
  onClose,
}: ToolCallDetailModalProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const [activeTab, setActiveTab] = useState('json');

  const resultParsed = useMemo(() => tryParseJson(result), [result]);

  const jsonViewTheme = useMemo(() => buildJsonViewTheme(theme), [theme]);

  const colorKey = getToolColorKey(toolType);
  const accentColor =
    theme.blockColor[colorKey as keyof typeof theme.blockColor]?.text ?? theme.color.primary;

  const accentBg =
    theme.blockColor[colorKey as keyof typeof theme.blockColor]?.bg ?? theme.color.primaryBg;

  const monacoTheme = theme.mode === 'dark' ? 'vs-dark' : 'vs';

  const tabItems = [
    ...(resultParsed.isJson
      ? [
          {
            key: 'json',
            label: t('toolCall.preview'),
            children: (
              <div
                css={css`
                  padding: ${theme.spacing[3]};
                  border-radius: ${theme.radius.md};
                  background: ${theme.color.bgContainer};
                  border: 1px solid ${theme.color.border};
                  height: 400px;
                  overflow: auto;
                `}
              >
                <JsonView
                  src={resultParsed.data as object}
                  theme={jsonViewTheme}
                  collapsed={2}
                  enableClipboard
                  displayDataTypes={false}
                  displayObjectSize
                  indentWidth={2}
                />
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'raw',
      label: '原始数据',
      children: (
        <div
          css={css`
            border-radius: ${theme.radius.md};
            border: 1px solid ${theme.color.border};
            overflow: hidden;
          `}
        >
          <Editor
            height="400px"
            defaultLanguage={resultParsed.isJson ? 'json' : 'plaintext'}
            value={result ?? ''}
            theme={monacoTheme}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              folding: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: parseInt(theme.font.size.base),
              fontFamily: theme.font.familyMono,
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={640}
      centered
      closeIcon={<X size={16} />}
      footer={null}
      styles={{
        header: {
          borderBottom: `1px solid ${theme.color.borderSecondary}`,
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          margin: 0,
        },
        body: {
          padding: `${theme.spacing[4]}`,
          background: theme.color.bgBase,
        },
        root: {
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          boxShadow: theme.shadow.lg,
        },
        mask: {
          backgroundColor: 'rgba(0,0,0,0.4)',
        },
      }}
      title={
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[3]};
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: ${theme.radius.md};
              background: ${accentBg};
              color: ${accentColor};
              flex-shrink: 0;
            `}
          >
            <Wrench size={16} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.lg};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {toolName}
          </span>
          {toolType && (
            <span
              css={css`
                font-size: ${theme.font.size.xs};
                font-weight: ${theme.font.weight.bold};
                text-transform: uppercase;
                letter-spacing: 0.06em;
                padding: 2px 8px;
                border-radius: ${theme.radius.sm};
                background: ${accentBg};
                color: ${accentColor};
                flex-shrink: 0;
              `}
            >
              {toolType}
            </span>
          )}
        </div>
      }
    >
      {/* Input Section */}
      <div
        css={css`
          margin-bottom: ${theme.spacing[4]};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${theme.color.textTertiary};
            margin-bottom: ${theme.spacing[2]};
          `}
        >
          <span
            css={css`
              width: 6px;
              height: 6px;
              border-radius: ${theme.radius.full};
              background: ${theme.color.info};
            `}
          />
          {t('toolCall.inputParams')}
        </div>
        <Input.TextArea
          value={args ?? ''}
          readOnly
          autoSize={{ minRows: 2, maxRows: 6 }}
          css={css`
            font-family: ${theme.font.familyMono} !important;
            font-size: ${theme.font.size.sm} !important;
            background: ${theme.color.bgSpotlight} !important;
            border-color: ${theme.color.borderSecondary} !important;
            color: ${theme.color.textSecondary} !important;
            & textarea::selection {
              background: ${theme.color.primaryBg};
            }
          `}
        />
      </div>

      {/* Output Section */}
      <div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            font-size: ${theme.font.size.xs};
            font-weight: ${theme.font.weight.semibold};
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${theme.color.textTertiary};
            margin-bottom: ${theme.spacing[2]};
          `}
        >
          <span
            css={css`
              width: 6px;
              height: 6px;
              border-radius: ${theme.radius.full};
              background: ${theme.color.success};
            `}
          />
          {t('toolCall.executionResult')}
        </div>
        <Tabs
          size="small"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          css={css`
            .ant-tabs-nav {
              margin-bottom: ${theme.spacing[3]} !important;
            }
            .ant-tabs-tab {
              font-size: ${theme.font.size.base};
              font-weight: ${theme.font.weight.medium};
              color: ${theme.color.textSecondary};
              padding: ${theme.spacing[2]} ${theme.spacing[3]} !important;
            }
            .ant-tabs-tab-active .ant-tabs-tab-btn {
              color: ${theme.color.primary} !important;
              font-weight: ${theme.font.weight.semibold};
            }
            .ant-tabs-ink-bar {
              background: ${theme.color.primary} !important;
            }
          `}
        />
      </div>
    </Modal>
  );
}
