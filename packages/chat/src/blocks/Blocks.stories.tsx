/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatContext } from '../context.js';
import { BlockCard } from './BlockCard.js';
import { ThinkingBlock } from './ThinkingBlock.js';
import { ToolCallBlock } from './ToolCallBlock.js';
import { PlanBlock } from './PlanBlock.js';
import { ErrorBlock } from './ErrorBlock.js';
import { HumanInputBlock } from './HumanInputBlock.js';
import { SkillBlock } from './SkillBlock.js';
import { BlocksRenderer } from './BlocksRenderer.js';
import type { Block } from '../types.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </ChatContext.Provider>
  );
}

const meta: Meta<typeof BlockCard> = {
  title: 'Chat/Blocks',
  component: BlockCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---- BlockCard ----

export const BlockCardDefault: Story = {
  args: {
    title: '执行块标题',
    children: '这是执行块的内容区域。',
  },
};

export const BlockCardWithIcon: Story = {
  args: {
    icon: <span>🔧</span>,
    title: '带图标的卡片',
    accentColor: '#6366f1',
    tag: 'MCP',
    children: '这是一个带图标、色条和标签的卡片。',
  },
};

// ---- ThinkingBlock ----

export const ThinkingCompleted: Story = {
  render: () => {
    const block: Block = {
      id: 'b1',
      type: 'thinking',
      status: 'completed',
      content: '用户想要了解项目结构，我需要先读取文件目录，然后分析各个模块的职责...',
    };
    return (
      <Wrapper>
        <ThinkingBlock block={block} />
      </Wrapper>
    );
  },
};

export const ThinkingStreaming: Story = {
  render: () => {
    const block: Block = {
      id: 'b2',
      type: 'thinking',
      status: 'streaming',
      content: '让我想想这个问题应该怎么解决...',
    };
    return (
      <Wrapper>
        <ThinkingBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- ToolCallBlock ----

export const ToolCallMcp: Story = {
  render: () => {
    const block: Block = {
      id: 'b3',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'read_file',
        toolType: 'mcp',
        toolArgs: '{"path": "/src/index.ts"}',
        toolResult: 'export * from "./types";\nexport * from "./Chat";',
      },
    };
    return (
      <Wrapper>
        <ToolCallBlock block={block} />
      </Wrapper>
    );
  },
};

export const ToolCallScript: Story = {
  render: () => {
    const block: Block = {
      id: 'b4',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'run_python',
        toolType: 'script',
        toolArgs: '{"script": "print(1+1)"}',
        toolResult: '2',
      },
    };
    return (
      <Wrapper>
        <ToolCallBlock block={block} />
      </Wrapper>
    );
  },
};

export const ToolCallBuiltin: Story = {
  render: () => {
    const block: Block = {
      id: 'b5',
      type: 'tool_call',
      status: 'completed',
      content: '',
      metadata: {
        toolName: 'web_search',
        toolType: 'builtin',
        toolArgs: '{"query": "TypeScript 5.0 features"}',
      },
    };
    return (
      <Wrapper>
        <ToolCallBlock block={block} />
      </Wrapper>
    );
  },
};

export const ToolCallError: Story = {
  render: () => {
    const block: Block = {
      id: 'b6',
      type: 'tool_call',
      status: 'error',
      content: '',
      metadata: {
        toolName: 'read_file',
        toolType: 'mcp',
        toolArgs: '{"path": "/nonexistent.ts"}',
        toolResult: 'Error: File not found',
      },
    };
    return (
      <Wrapper>
        <ToolCallBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- PlanBlock ----

export const PlanDefault: Story = {
  render: () => {
    const block: Block = {
      id: 'b7',
      type: 'plan',
      status: 'streaming',
      content: '',
      metadata: {
        steps: [
          { content: '读取项目配置文件', status: 'completed' },
          { content: '分析依赖关系', status: 'running' },
          { content: '生成优化建议', status: 'pending' },
          { content: '输出报告', status: 'pending' },
        ],
      },
    };
    return (
      <Wrapper>
        <PlanBlock block={block} />
      </Wrapper>
    );
  },
};

export const PlanCompleted: Story = {
  render: () => {
    const block: Block = {
      id: 'b8',
      type: 'plan',
      status: 'completed',
      content: '',
      metadata: {
        steps: [
          { content: '读取项目配置文件', status: 'completed' },
          { content: '分析依赖关系', status: 'completed' },
          { content: '生成优化建议', status: 'completed' },
        ],
      },
    };
    return (
      <Wrapper>
        <PlanBlock block={block} />
      </Wrapper>
    );
  },
};

export const PlanWithError: Story = {
  render: () => {
    const block: Block = {
      id: 'b9',
      type: 'plan',
      status: 'error',
      content: '',
      metadata: {
        steps: [
          { content: '初始化环境', status: 'completed' },
          { content: '读取配置文件', status: 'completed' },
          { content: '连接数据库', status: 'error' },
          { content: '导出数据', status: 'skipped' },
        ],
      },
    };
    return (
      <Wrapper>
        <PlanBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- ErrorBlock ----

export const ErrorDefault: Story = {
  render: () => {
    const block: Block = {
      id: 'b10',
      type: 'error',
      status: 'error',
      content: '连接超时：无法连接到 MCP 服务器。\n请检查网络配置后重试。',
      metadata: {
        errorCode: 'ETIMEDOUT',
      },
    };
    return (
      <Wrapper>
        <ErrorBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- HumanInputBlock ----

export const HumanInputConfirmation: Story = {
  render: () => {
    const block: Block = {
      id: 'b11',
      type: 'human_input',
      status: 'pending',
      content: '',
      metadata: {
        requestId: 'req-1',
        inputType: 'confirmation',
        title: '确认删除',
        message: '确定要删除这个文件吗？此操作不可撤销。',
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock
          block={block}
          onConfirm={(reqId, resp) => alert(`请求 ${reqId}: ${JSON.stringify(resp)}`)}
        />
      </Wrapper>
    );
  },
};

export const HumanInputTextInput: Story = {
  render: () => {
    const block: Block = {
      id: 'b12',
      type: 'human_input',
      status: 'pending',
      content: '',
      metadata: {
        requestId: 'req-2',
        inputType: 'input',
        title: '输入文件名',
        message: '请输入新文件的名称：',
        defaultValue: 'untitled.ts',
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock
          block={block}
          onConfirm={(reqId, resp) => alert(`请求 ${reqId}: ${resp}`)}
        />
      </Wrapper>
    );
  },
};

export const HumanInputSingleSelect: Story = {
  render: () => {
    const block: Block = {
      id: 'b13',
      type: 'human_input',
      status: 'pending',
      content: '',
      metadata: {
        requestId: 'req-3',
        inputType: 'single-select',
        title: '选择模板',
        message: '请选择项目模板：',
        options: [
          { label: 'React App', value: 'react' },
          { label: 'Node.js CLI', value: 'node-cli' },
          { label: 'Python Package', value: 'python' },
        ],
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock
          block={block}
          onConfirm={(reqId, resp) => alert(`请求 ${reqId}: ${resp}`)}
        />
      </Wrapper>
    );
  },
};

export const HumanInputMultiSelect: Story = {
  render: () => {
    const block: Block = {
      id: 'b14',
      type: 'human_input',
      status: 'pending',
      content: '',
      metadata: {
        requestId: 'req-4',
        inputType: 'multi-select',
        title: '选择功能',
        message: '请选择要启用的功能：',
        options: [
          { label: 'TypeScript', value: 'ts' },
          { label: 'ESLint', value: 'eslint' },
          { label: 'Prettier', value: 'prettier' },
          { label: 'Vitest', value: 'vitest' },
        ],
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock
          block={block}
          onConfirm={(reqId, resp) => alert(`请求 ${reqId}: ${JSON.stringify(resp)}`)}
        />
      </Wrapper>
    );
  },
};

export const HumanInputCompleted: Story = {
  render: () => {
    const block: Block = {
      id: 'b15',
      type: 'human_input',
      status: 'completed',
      content: '',
      metadata: {
        requestId: 'req-5',
        inputType: 'confirmation',
        title: '确认操作',
        message: '用户已确认此操作。',
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- SkillBlock ----

export const SkillLoading: Story = {
  render: () => {
    const block: Block = {
      id: 'b16',
      type: 'skill',
      status: 'streaming',
      content: '',
      metadata: {
        skillName: 'code-reviewer',
        phase: 'loading',
      },
    };
    return (
      <Wrapper>
        <SkillBlock block={block} />
      </Wrapper>
    );
  },
};

export const SkillLoaded: Story = {
  render: () => {
    const block: Block = {
      id: 'b17',
      type: 'skill',
      status: 'completed',
      content: '',
      metadata: {
        skillName: 'code-reviewer',
        phase: 'loaded',
        tokenCount: 3420,
      },
    };
    return (
      <Wrapper>
        <SkillBlock block={block} />
      </Wrapper>
    );
  },
};

export const SkillExecuting: Story = {
  render: () => {
    const block: Block = {
      id: 'b18',
      type: 'skill',
      status: 'streaming',
      content: '',
      metadata: {
        skillName: 'code-reviewer',
        phase: 'executing',
        task: '审查 src/index.ts',
      },
    };
    return (
      <Wrapper>
        <SkillBlock block={block} />
      </Wrapper>
    );
  },
};

export const SkillCompleted: Story = {
  render: () => {
    const block: Block = {
      id: 'b19',
      type: 'skill',
      status: 'completed',
      content: '发现 3 处潜在问题，已给出修改建议。',
      metadata: {
        skillName: 'code-reviewer',
        phase: 'completed',
      },
    };
    return (
      <Wrapper>
        <SkillBlock block={block} />
      </Wrapper>
    );
  },
};

export const SkillError: Story = {
  render: () => {
    const block: Block = {
      id: 'b20',
      type: 'skill',
      status: 'error',
      content: '技能文件 SKILL.md 格式错误：缺少 name 字段',
      metadata: {
        skillName: 'broken-skill',
      },
    };
    return (
      <Wrapper>
        <SkillBlock block={block} />
      </Wrapper>
    );
  },
};

// ---- BlocksRenderer ----

export const AllBlocks: Story = {
  render: () => {
    const blocks: Block[] = [
      {
        id: 'b1',
        type: 'thinking',
        status: 'completed',
        content: '分析用户需求...',
      },
      {
        id: 'b2',
        type: 'plan',
        status: 'streaming',
        content: '',
        metadata: {
          steps: [
            { content: '步骤一', status: 'completed' },
            { content: '步骤二', status: 'running' },
            { content: '步骤三', status: 'pending' },
          ],
        },
      },
      {
        id: 'b3',
        type: 'tool_call',
        status: 'completed',
        content: '',
        metadata: {
          toolName: 'search',
          toolType: 'mcp',
          toolArgs: '{"q": "test"}',
          toolResult: 'OK',
        },
      },
      {
        id: 'b4',
        type: 'skill',
        status: 'completed',
        content: '发现 3 处潜在问题，已给出修改建议。',
        metadata: {
          skillName: 'code-reviewer',
          phase: 'completed',
        },
      },
      {
        id: 'b5',
        type: 'human_input',
        status: 'pending',
        content: '',
        metadata: {
          requestId: 'req-1',
          inputType: 'confirmation',
          title: '确认执行',
          message: '确定要继续吗？',
        },
      },
    ];
    return (
      <Wrapper>
        <BlocksRenderer blocks={blocks} />
      </Wrapper>
    );
  },
};
