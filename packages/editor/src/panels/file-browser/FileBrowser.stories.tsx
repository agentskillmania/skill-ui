/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { FolderOpen } from 'lucide-react';
import { Segmented } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Sidebar, SidebarPanel } from '@agentskillmania/skill-ui-shared';
import { NAMESPACE } from '../../locales/index.js';
import { FileBrowser } from './FileBrowser.js';
import type { ArtifactEntry, FileBrowserSource, ProjectFile } from '../../types.js';

const meta: Meta<typeof FileBrowser> = {
  title: 'Editor/FileBrowser',
  component: FileBrowser,
  tags: ['autodocs'],
  decorators: [
    (Story, ctx) => {
      const width = (ctx.parameters.paneWidth as number | undefined) ?? 700;
      return (
        <div style={{ height: 480, width, display: 'flex' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FileBrowser>;

const artifacts: ArtifactEntry[] = [
  { path: 'design/plan.md', status: 'created', lastTouch: 4, ops: ['file_write'] },
  { path: 'poster.png', status: 'created', lastTouch: 3, ops: ['file_write'] },
  { path: 'src/main.rs', status: 'modified', lastTouch: 5, ops: ['file_write', 'file_edit'] },
  { path: 'src/lib.rs', status: 'modified', lastTouch: 2, ops: ['file_edit'] },
];

const workspaceFiles: ProjectFile[] = [
  { path: 'README.md' },
  { path: 'poster.png' },
  {
    path: 'design',
    isDirectory: true,
    children: [{ path: 'design/plan.md' }, { path: 'design/mockup.html' }],
  },
  {
    path: 'src',
    isDirectory: true,
    children: [{ path: 'src/main.rs' }, { path: 'src/lib.rs' }, { path: 'src/utils.rs' }],
  },
];

/** 模拟内容端点:文本按路径返回,图片返回内联 SVG data URL */
function useFakeContent(activePath: string | null) {
  const [state, setState] = useState<{ content?: string; unsupported?: boolean }>({});
  useEffect(() => {
    if (!activePath) return;
    setState({});
    const timer = setTimeout(() => {
      if (activePath.endsWith('.png')) {
        setState({ unsupported: true });
      } else {
        setState({
          content: `// ${activePath}\nfn main() {\n    println!("hello from ${activePath}");\n}\n`,
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [activePath]);
  return state;
}

const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35406e"/><stop offset="0.6" stop-color="#e8734a"/><stop offset="0.8" stop-color="#f9dd9c"/><stop offset="1" stop-color="#16304f"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/></svg>`
  );

function InteractiveStory({ imageResolver }: { imageResolver?: boolean }) {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'code' | 'wysiwyg'>('code');
  const { content, unsupported } = useFakeContent(activePath);

  return (
    <FileBrowser
      workspaceFiles={workspaceFiles}
      artifacts={artifacts}
      activePath={activePath}
      activeContent={content}
      activeUnsupported={unsupported}
      onActivePathChange={setActivePath}
      editMode={editMode}
      onEditModeChange={setEditMode}
      imageSrcResolver={imageResolver ? () => DEMO_IMAGE : undefined}
      onOpenInFolder={(p) => window.alert(`reveal: ${p}`)}
    />
  );
}

/** 宽容器:左右排列(≥560px),产物默认源 */
export const Row: Story = {
  render: () => <InteractiveStory />,
};

/** 窄容器(<560px):上下排列 */
export const Stacked: Story = {
  parameters: { paneWidth: 420 },
  render: () => <InteractiveStory />,
};

/** 图片通道已注入(imageSrcResolver)时的内联预览 */
export const WithImagePreview: Story = {
  render: () => <InteractiveStory imageResolver />,
};

/**
 * 整装演示:边窗 = shared Sidebar + SidebarPanel(headerExtra 承载源切换),
 * FileBrowser 以受控 source 接入 —— k3 客户端的接入形态。
 */
export const InSidebar: Story = {
  parameters: { paneWidth: 900 },
  render: () => {
    const [source, setSource] = useState<FileBrowserSource>('artifacts');
    const [activePath, setActivePath] = useState<string | null>(null);
    const { content, unsupported } = useFakeContent(activePath);
    const theme = useTheme();
    const { t } = useTranslation(NAMESPACE);

    return (
      <div
        css={css`
          height: 480px;
          display: flex;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.md};
          overflow: hidden;
        `}
      >
        {/* 假的主窗口内容区,衬托边窗 */}
        <div
          css={css`
            flex: 1;
            background: ${theme.color.bgLayout};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme.color.textTertiary};
          `}
        >
          主对话窗口(示意)
        </div>
        <Sidebar
          width={480}
          isCollapsed={false}
          activePanel="files"
          items={[{ id: 'files', icon: FolderOpen, label: t('fileBrowser.sourceWorkspace') }]}
          onToggleCollapse={() => {}}
          onSwitchPanel={() => {}}
        >
          <SidebarPanel
            title={t('fileBrowser.sourceWorkspace')}
            icon={FolderOpen}
            headerExtra={
              <Segmented
                size="small"
                value={source}
                onChange={(v) => setSource(v as FileBrowserSource)}
                options={[
                  { label: t('fileBrowser.sourceArtifacts'), value: 'artifacts' },
                  { label: t('fileBrowser.sourceWorkspace'), value: 'workspace' },
                ]}
              />
            }
          >
            <FileBrowser
              workspaceFiles={workspaceFiles}
              artifacts={artifacts}
              source={source}
              onSourceChange={setSource}
              activePath={activePath}
              activeContent={content}
              activeUnsupported={unsupported}
              onActivePathChange={setActivePath}
              imageSrcResolver={() => DEMO_IMAGE}
            />
          </SidebarPanel>
        </Sidebar>
      </div>
    );
  },
};
