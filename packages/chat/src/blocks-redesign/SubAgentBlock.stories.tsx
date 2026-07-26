/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SubAgentBlock } from './SubAgentBlock.js';
import type { Block, Message } from '../types.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  );
}

const meta: Meta<typeof SubAgentBlock> = {
  title: 'Chat/BlocksRedesign/SubAgentBlock',
  component: SubAgentBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---- Streaming (running) ----

export const Streaming: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-stream',
      type: 'subagent',
      status: 'streaming',
      content: '',
      metadata: {
        name: 'researcher',
        task: '搜索 2026 年 AI 框架对比信息',
        steps: 3,
        inputTokens: 12480,
        outputTokens: 2150,
        duration: 18400,
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Completed (success) ----

export const Completed: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-done',
      type: 'subagent',
      status: 'completed',
      content: '',
      metadata: {
        name: 'researcher',
        task: '调研 TypeScript 5.0 新特性',
        steps: 5,
        inputTokens: 24310,
        outputTokens: 4820,
        duration: 32500,
        resultStatus: 'success',
        messages: [
          {
            id: 'm1',
            role: 'user',
            content: '调研 TypeScript 5.0 新特性',
            timestamp: Date.now(),
          },
          {
            id: 'm2',
            role: 'assistant',
            content:
              'TypeScript 5.0 的主要新特性包括：\n\n1. **新的 `--moduleResolution bundler` 选项**\n2. **`verbatimModuleSyntax` 标志**\n3. **支持 `export type *`**\n4. **枚举类型改进**\n5. **`const` 类型参数**\n\n详细说明见调研报告。',
            timestamp: Date.now(),
          },
        ] as Message[],
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Max steps reached ----

export const MaxSteps: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-max',
      type: 'subagent',
      status: 'completed',
      content: '',
      metadata: {
        name: 'writer',
        task: '生成 10000 字的长文',
        steps: 50,
        inputTokens: 89200,
        outputTokens: 31200,
        duration: 180000,
        resultStatus: 'max_steps',
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Error ----

export const Error: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-err',
      type: 'subagent',
      status: 'error',
      content: '',
      metadata: {
        name: 'coder',
        task: '执行构建脚本',
        steps: 2,
        inputTokens: 5230,
        outputTokens: 890,
        duration: 12400,
        resultStatus: 'error',
        error: 'TypeError: Cannot read properties of undefined (reading "map")',
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Timeout ----

export const Timeout: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-timeout',
      type: 'subagent',
      status: 'completed',
      content: '',
      metadata: {
        name: 'analyst',
        task: '分析大型数据集',
        steps: 12,
        inputTokens: 45600,
        outputTokens: 8200,
        duration: 60000,
        resultStatus: 'timeout',
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Aborted ----

export const Aborted: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-abort',
      type: 'subagent',
      status: 'completed',
      content: '',
      metadata: {
        name: 'tester',
        task: '运行测试套件',
        steps: 8,
        inputTokens: 18200,
        outputTokens: 3400,
        duration: 42000,
        resultStatus: 'abort',
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Minimal (only name, no metrics) ----

export const Minimal: Story = {
  render: () => {
    const block: Block = {
      id: 'sa-min',
      type: 'subagent',
      status: 'streaming',
      content: '',
      metadata: {
        name: 'helper',
      },
    };
    return (
      <Wrapper>
        <SubAgentBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- Multiple blocks together ----

export const MultipleBlocks: Story = {
  render: () => {
    const blocks: Block[] = [
      {
        id: 'sa-1',
        type: 'subagent',
        status: 'completed',
        content: '',
        metadata: {
          name: 'researcher',
          task: '调研 React 19 新特性',
          steps: 4,
          inputTokens: 18200,
          outputTokens: 3200,
          duration: 21500,
          resultStatus: 'success',
        },
      },
      {
        id: 'sa-2',
        type: 'subagent',
        status: 'streaming',
        content: '',
        metadata: {
          name: 'writer',
          task: '撰写技术博客初稿',
          steps: 7,
          inputTokens: 32100,
          outputTokens: 8600,
          duration: 41200,
        },
      },
      {
        id: 'sa-3',
        type: 'subagent',
        status: 'error',
        content: '',
        metadata: {
          name: 'reviewer',
          task: '代码审查',
          steps: 1,
          inputTokens: 4200,
          outputTokens: 120,
          duration: 3200,
          resultStatus: 'error',
          error: '连接超时：无法连接到代码仓库',
        },
      },
    ];
    return (
      <Wrapper>
        {blocks.map((b) => (
          <SubAgentBlock key={b.id} block={b} />
        ))}
      </Wrapper>
    );
  },
};
