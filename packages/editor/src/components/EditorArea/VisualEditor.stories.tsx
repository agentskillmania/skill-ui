/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { VisualEditor } from './VisualEditor.js';
import type { EditorAreaProps } from '../../types.js';

const sampleMarkdownContent = `# 技能标题

## 描述
这是一个示例技能。

## 步骤

1. 接收输入
2. 处理数据
3. 返回结果

---

**粗体文本** 和 *斜体文本*

- 无序列表项 1
- 无序列表项 2

| 列 A | 列 B |
|------|------|
| 数据 | 数据 |
`;

const meta: Meta<typeof VisualEditor> = {
  title: 'Editor/VisualEditor',
  component: VisualEditor,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['wysiwyg', 'code'],
    },
    readOnly: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisualEditor>;

export const Interactive: Story = {
  render: () => {
    const [content, setContent] = useState(sampleMarkdownContent);

    const props: EditorAreaProps = {
      content,
      filePath: 'SKILL.md',
      mode: 'wysiwyg',
      readOnly: false,
      onChange: (newContent) => {
        setContent(newContent);
      },
      onSave: (savedContent) => {
        console.log('保存的内容:', savedContent);
      },
    };

    return (
      <div
        style={{
          height: 600,
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 16,
        }}
      >
        <VisualEditor {...props} />
      </div>
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const props: EditorAreaProps = {
      content: sampleMarkdownContent,
      filePath: 'SKILL.md',
      mode: 'wysiwyg',
      readOnly: true,
      onChange: () => {
        // 只读模式下不应该有变化
      },
    };

    return (
      <div
        style={{
          height: 600,
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 16,
        }}
      >
        <VisualEditor {...props} />
      </div>
    );
  },
};