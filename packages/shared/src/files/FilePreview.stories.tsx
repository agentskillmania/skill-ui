/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilePreview } from './FilePreview.js';

const meta: Meta<typeof FilePreview> = {
  title: 'Files/FilePreview',
  component: FilePreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilePreview>;

const mdContent = `# 示例文档

这是 **markdown** 预览。

- 列表项一
- 列表项二

\`\`\`ts
const x: number = 42;
\`\`\`

> 引用块

| 列 A | 列 B |
|---|---|
| 1 | 2 |
`;

const codeContent = `export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
`;

export const Markdown: Story = {
  args: { path: 'README.md', content: mdContent },
  render: (args) => (
    <div style={{ height: 480, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <FilePreview {...args} />
    </div>
  ),
};

export const Code: Story = {
  args: { path: 'src/index.ts', content: codeContent },
  render: (args) => (
    <div style={{ height: 240, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <FilePreview {...args} />
    </div>
  ),
};

export const PlainText: Story = {
  args: { path: 'notes.txt', content: '纯文本兜底渲染。\n第二行。' },
  render: (args) => (
    <div style={{ height: 160, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <FilePreview {...args} />
    </div>
  ),
};
