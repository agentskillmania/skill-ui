/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { ChatContext } from '../context.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600 }}>{children}</div>
    </ChatContext.Provider>
  );
}

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Chat/Content/MarkdownRenderer',
  component: MarkdownRenderer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

/** 纯文本 */
export const PlainText: Story = {
  render: () => (
    <Wrapper>
      <MarkdownRenderer>这是一段纯文本内容。</MarkdownRenderer>
    </Wrapper>
  ),
};

/** 多行文本 */
export const Multiline: Story = {
  render: () => (
    <Wrapper>
      <MarkdownRenderer>{'第一行\n第二行\n第三行'}</MarkdownRenderer>
    </Wrapper>
  ),
};

/** 流式输出 */
export const Streaming: Story = {
  render: () => (
    <Wrapper>
      <MarkdownRenderer streaming>正在生成内容...</MarkdownRenderer>
    </Wrapper>
  ),
};

/** 长文本 */
export const LongText: Story = {
  render: () => (
    <Wrapper>
      <MarkdownRenderer>
        {
          '这是一个比较长的文本内容，用于测试文本换行和排版效果。\n\n第二段内容开始，展示 Markdown 渲染器对多段落的支持。\n\n第三段内容，展示换行效果。'
        }
      </MarkdownRenderer>
    </Wrapper>
  ),
};
