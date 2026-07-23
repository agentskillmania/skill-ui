/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingBlock } from './ThinkingBlock.js';
import { ToolCallBlock } from './ToolCallBlock.js';
import { PlanBlock } from './PlanBlock.js';
import { ErrorBlock } from './ErrorBlock.js';
import { HumanInputBlock } from './HumanInputBlock.js';
import { SkillBlock } from './SkillBlock.js';
import { BlocksRenderer } from './BlocksRenderer.js';
import { A2UIBlock } from './A2UIBlock.js';
import type { Block } from '../types.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  );
}

const meta: Meta<typeof BlocksRenderer> = {
  title: 'Chat/BlocksRedesign',
  component: BlocksRenderer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---- ThinkingBlock ----

export const ThinkingCompleted: Story = {
  render: () => {
    const block: Block = {
      id: 'b1',
      type: 'thinking',
      status: 'completed',
      content: '用户想要了解项目结构，我需要先读取文件目录，然后分析各个模块的职责和依赖关系...',
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
      content:
        '让我想想这个问题应该怎么解决。首先，用户提到了多个来源，我需要并行调用 web_search...',
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
        toolResult:
          '{\n  "content": "export * from \\"./types\\";\\nexport * from \\"./Chat\\";",\n  "size": 42,\n  "lines": 2\n}',
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
        toolResult: 'Found 12 results in 1.2s',
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

export const ToolCallStreaming: Story = {
  render: () => {
    const block: Block = {
      id: 'b6b',
      type: 'tool_call',
      status: 'streaming',
      content: '',
      metadata: {
        toolName: 'web_search',
        toolType: 'builtin',
        toolArgs: '{"query": "AI news 2026"}',
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

export const ErrorWithHint: Story = {
  render: () => {
    const block: Block = {
      id: 'b10',
      type: 'error',
      status: 'error',
      content:
        'ToolCall timed out after 30000ms\n  at web_search (mcp://search-provider)\n  at AgentRunner.executeTool (colts/runner.ts:234)\n  at async AgentRunner.step (colts/runner.ts:189)',
      metadata: {
        errorCode: 'TIMEOUT',
        hint: '可能是网络问题，建议重试或检查 MCP 服务状态',
      },
    };
    return (
      <Wrapper>
        <ErrorBlock block={block} />
      </Wrapper>
    );
  },
};

export const ErrorWithoutCode: Story = {
  render: () => {
    const block: Block = {
      id: 'b10b',
      type: 'error',
      status: 'error',
      content: '连接超时：无法连接到 MCP 服务器。\n请检查网络配置后重试。',
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
        title: '费用确认',
        message: '本次搜索将调用 3 个外部 API，预计消耗约 0.02 USD，是否继续？',
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
        title: '搜索关键词',
        message: '你想了解 AI 的哪个具体方向？',
        defaultValue: '大模型',
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
        title: '结果排序',
        message: '请选择排序方式：',
        options: [
          { label: '按时间（最新优先）', value: 'time' },
          { label: '按相关性', value: 'relevance' },
          { label: '按来源权威性', value: 'authority' },
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
        title: '费用确认',
        message: '用户已确认此操作。',
        response: true,
      },
    };
    return (
      <Wrapper>
        <HumanInputBlock block={block} />
      </Wrapper>
    );
  },
};

export const HumanInputCompletedWithText: Story = {
  render: () => {
    const block: Block = {
      id: 'b15b',
      type: 'human_input',
      status: 'completed',
      content: '',
      metadata: {
        requestId: 'req-6',
        inputType: 'input',
        title: '搜索关键词',
        response: '大模型, 多模态',
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
        skillName: 'ai-news',
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
        skillName: 'ai-news',
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
        skillName: 'ai-news',
        phase: 'executing',
        task: '搜索多来源新闻',
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
      content: '发现 3 条最新 AI 新闻，已整理汇总。',
      metadata: {
        skillName: 'ai-news',
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

// ---- A2UIBlock ----

export const A2UIDashboard: Story = {
  name: 'A2UI Dashboard',
  render: () => {
    const components = [
      {
        id: 'root',
        type: 'Column',
        children: ['title', 'subtitle', 'divider1', 'kpiRow', 'divider2', 'chartRow'],
      },
      { id: 'title', type: 'Text', text: 'Sales Dashboard', variant: 'h2' },
      {
        id: 'subtitle',
        type: 'Text',
        text: 'Q1 2026 Overview',
        variant: 'caption',
        style: { color: '#666' },
      },
      { id: 'divider1', type: 'Divider' },
      { id: 'kpiRow', type: 'Row', gutter: 16, children: ['kpiCol1', 'kpiCol2', 'kpiCol3'] },
      { id: 'kpiCol1', type: 'Column', span: 8, children: ['kpiCard1'] },
      { id: 'kpiCol2', type: 'Column', span: 8, children: ['kpiCard2'] },
      { id: 'kpiCol3', type: 'Column', span: 8, children: ['kpiCard3'] },
      { id: 'kpiCard1', type: 'Card', title: 'Revenue', bordered: true, children: ['kpiVal1'] },
      { id: 'kpiVal1', type: 'Text', text: '$128,400', variant: 'h3', style: { color: '#52c41a' } },
      { id: 'kpiCard2', type: 'Card', title: 'Orders', bordered: true, children: ['kpiVal2'] },
      { id: 'kpiVal2', type: 'Text', text: '1,247', variant: 'h3', style: { color: '#1890ff' } },
      { id: 'kpiCard3', type: 'Card', title: 'Avg. Order', bordered: true, children: ['kpiVal3'] },
      { id: 'kpiVal3', type: 'Text', text: '$102.97', variant: 'h3', style: { color: '#722ed1' } },
      { id: 'divider2', type: 'Divider' },
      { id: 'chartRow', type: 'Row', gutter: 16, children: ['chartCol', 'tableCol'] },
      { id: 'chartCol', type: 'Column', span: 14, children: ['lineChart'] },
      { id: 'tableCol', type: 'Column', span: 10, children: ['dataTable'] },
      {
        id: 'lineChart',
        type: 'Chart',
        chartType: 'line',
        data: [
          { month: 'Jan', revenue: 65000 },
          { month: 'Feb', revenue: 72000 },
          { month: 'Mar', revenue: 89000 },
          { month: 'Apr', revenue: 95000 },
        ],
        config: { xField: 'month', yField: 'revenue', smooth: true },
      },
      {
        id: 'dataTable',
        type: 'Table',
        columns: [
          { title: 'Product', dataIndex: 'product', key: 'product' },
          { title: 'Sales', dataIndex: 'sales', key: 'sales' },
          { title: 'Revenue', dataIndex: 'revenue', key: 'revenue' },
        ],
        dataSource: [
          { id: '1', product: 'Widget A', sales: 432, revenue: '$43,200' },
          { id: '2', product: 'Widget B', sales: 298, revenue: '$35,760' },
          { id: '3', product: 'Widget C', sales: 517, revenue: '$49,440' },
        ],
        bordered: true,
        size: 'small',
        pagination: false,
      },
    ];
    const block: Block = {
      id: 'a2ui-dash',
      type: 'a2ui',
      status: 'completed',
      content: [
        '{"createSurface":{"surfaceId":"dashboard","catalogId":"default","theme":{}}}',
        `{"updateComponents":{"surfaceId":"dashboard","components":${JSON.stringify(components)}}}`,
      ].join('\n'),
      metadata: { surfaceId: 'dashboard', title: 'Sales Dashboard' },
    };
    return (
      <Wrapper>
        <A2UIBlock block={block} />
      </Wrapper>
    );
  },
};

export const A2UIForm: Story = {
  name: 'A2UI Registration Form',
  render: () => {
    const components = [
      {
        id: 'root',
        type: 'Column',
        children: [
          'formTitle',
          'formDesc',
          'divider1',
          'nameField',
          'emailField',
          'rolePicker',
          'checkRow',
          'dob',
          'experience',
          'divider2',
          'btnRow',
        ],
      },
      { id: 'formTitle', type: 'Text', text: 'Create Account', variant: 'h3' },
      {
        id: 'formDesc',
        type: 'Text',
        text: 'Fill in the details below to register.',
        variant: 'caption',
        style: { color: '#888' },
      },
      { id: 'divider1', type: 'Divider' },
      { id: 'nameField', type: 'TextField', placeholder: 'Enter your name' },
      { id: 'emailField', type: 'TextField', placeholder: 'Enter your email' },
      {
        id: 'rolePicker',
        type: 'ChoicePicker',
        placeholder: 'Select role',
        options: [
          { label: 'Developer', value: 'dev' },
          { label: 'Designer', value: 'design' },
          { label: 'Product Manager', value: 'pm' },
          { label: 'QA Engineer', value: 'qa' },
        ],
      },
      { id: 'checkRow', type: 'Row', gutter: 16, children: ['checkCol1', 'checkCol2'] },
      { id: 'checkCol1', type: 'Column', children: ['newsletter'] },
      { id: 'newsletter', type: 'CheckBox', checked: true },
      { id: 'checkCol2', type: 'Column', children: ['terms'] },
      { id: 'terms', type: 'CheckBox', checked: false },
      {
        id: 'dob',
        type: 'DateTimeInput',
        placeholder: 'Date of birth',
        mode: 'date',
        format: 'YYYY-MM-DD',
      },
      { id: 'experience', type: 'Slider', min: 0, max: 20, step: 1, value: 3 },
      { id: 'divider2', type: 'Divider' },
      { id: 'btnRow', type: 'Row', gutter: 12, children: ['btnCol1', 'btnCol2'] },
      { id: 'btnCol1', type: 'Column', children: ['btnCancel'] },
      { id: 'btnCancel', type: 'Button', text: 'Cancel', variant: 'default' },
      { id: 'btnCol2', type: 'Column', children: ['btnSubmit'] },
      { id: 'btnSubmit', type: 'Button', text: 'Create Account', variant: 'primary' },
    ];
    const block: Block = {
      id: 'a2ui-form',
      type: 'a2ui',
      status: 'completed',
      content: [
        '{"createSurface":{"surfaceId":"reg-form","catalogId":"default","theme":{}}}',
        `{"updateComponents":{"surfaceId":"reg-form","components":${JSON.stringify(components)}}}`,
      ].join('\n'),
      metadata: { surfaceId: 'reg-form', title: 'Registration Form' },
    };
    return (
      <Wrapper>
        <A2UIBlock block={block} />
      </Wrapper>
    );
  },
};

export const A2UITextLayout: Story = {
  name: 'A2UI Rich Text & Layout',
  render: () => {
    const components = [
      {
        id: 'root',
        type: 'Column',
        children: [
          'h1',
          'h2',
          'body1',
          'divider1',
          'h3',
          'listCard',
          'divider2',
          'mdCard',
          'rtCard',
        ],
      },
      { id: 'h1', type: 'Text', text: 'Project Overview', variant: 'h1' },
      { id: 'h2', type: 'Text', text: 'Architecture', variant: 'h2' },
      {
        id: 'body1',
        type: 'Text',
        text: 'This project uses a micro-frontend architecture with independent deployable modules.',
      },
      { id: 'divider1', type: 'Divider' },
      { id: 'h3', type: 'Text', text: 'Key Metrics', variant: 'h3' },
      { id: 'listCard', type: 'Card', title: 'Performance', bordered: true, children: ['list1'] },
      {
        id: 'list1',
        type: 'List',
        header: 'Metrics',
        bordered: true,
        size: 'small',
        dataSource: [
          { label: 'FCP', value: '0.8s' },
          { label: 'LCP', value: '1.2s' },
          { label: 'CLS', value: '0.02' },
        ],
      },
      { id: 'divider2', type: 'Divider' },
      { id: 'mdCard', type: 'Card', title: 'Markdown', children: ['md1'] },
      {
        id: 'md1',
        type: 'Markdown',
        text: '## Tech Stack\n- **Frontend**: React 19 + TypeScript\n- **Styling**: Emotion CSS-in-JS\n- **Build**: Vite + pnpm workspace\n\n> Architecture decision records are available in `docs/adr/`',
      },
      { id: 'rtCard', type: 'Card', title: 'Rich Text', children: ['rt1'] },
      {
        id: 'rt1',
        type: 'RichText',
        text: '<p>For more details, visit the <a href="#">documentation portal</a>.</p>',
      },
    ];
    const block: Block = {
      id: 'a2ui-text',
      type: 'a2ui',
      status: 'completed',
      content: [
        '{"createSurface":{"surfaceId":"text-demo","catalogId":"default","theme":{}}}',
        `{"updateComponents":{"surfaceId":"text-demo","components":${JSON.stringify(components)}}}`,
      ].join('\n'),
      metadata: { surfaceId: 'text-demo', title: 'Rich Text & Layout' },
    };
    return (
      <Wrapper>
        <A2UIBlock block={block} />
      </Wrapper>
    );
  },
};

export const A2UIInteractive: Story = {
  name: 'A2UI Interactive Controls',
  render: () => {
    const components = [
      {
        id: 'root',
        type: 'Column',
        children: ['title', 'btnCard', 'divider1', 'sliderCard', 'divider2', 'pickerCard'],
      },
      { id: 'title', type: 'Text', text: 'Control Panel', variant: 'h3' },
      { id: 'btnCard', type: 'Card', title: 'Buttons', children: ['btnRow'] },
      {
        id: 'btnRow',
        type: 'Row',
        gutter: 12,
        children: ['bc1', 'bc2', 'bc3', 'bc4', 'bc5', 'bc6'],
      },
      { id: 'bc1', type: 'Column', children: ['btnPrimary'] },
      { id: 'btnPrimary', type: 'Button', text: 'Primary', variant: 'primary' },
      { id: 'bc2', type: 'Column', children: ['btnDefault'] },
      { id: 'btnDefault', type: 'Button', text: 'Default', variant: 'default' },
      { id: 'bc3', type: 'Column', children: ['btnDashed'] },
      { id: 'btnDashed', type: 'Button', text: 'Dashed', variant: 'dashed' },
      { id: 'bc4', type: 'Column', children: ['btnDanger'] },
      { id: 'btnDanger', type: 'Button', text: 'Danger', variant: 'primary', danger: true },
      { id: 'bc5', type: 'Column', children: ['btnDisabled'] },
      { id: 'btnDisabled', type: 'Button', text: 'Disabled', variant: 'default', disabled: true },
      { id: 'bc6', type: 'Column', children: ['btnLoading'] },
      { id: 'btnLoading', type: 'Button', text: 'Loading...', variant: 'primary', loading: true },
      { id: 'divider1', type: 'Divider' },
      { id: 'sliderCard', type: 'Card', title: 'Sliders', children: ['slider1', 'sliderRange'] },
      { id: 'slider1', type: 'Slider', min: 0, max: 100, value: 45, step: 1 },
      { id: 'sliderRange', type: 'Slider', min: 0, max: 1000, value: [200, 800], range: true },
      { id: 'divider2', type: 'Divider' },
      {
        id: 'pickerCard',
        type: 'Card',
        title: 'Pickers',
        children: ['pickerSingle', 'pickerMulti'],
      },
      {
        id: 'pickerSingle',
        type: 'ChoicePicker',
        placeholder: 'Select language',
        options: [
          { label: 'TypeScript', value: 'ts' },
          { label: 'Python', value: 'py' },
          { label: 'Go', value: 'go' },
          { label: 'Rust', value: 'rs' },
        ],
      },
      {
        id: 'pickerMulti',
        type: 'ChoicePicker',
        placeholder: 'Select tags',
        mode: 'multiple',
        options: [
          { label: 'Frontend', value: 'fe' },
          { label: 'Backend', value: 'be' },
          { label: 'DevOps', value: 'ops' },
          { label: 'AI/ML', value: 'ai' },
        ],
      },
    ];
    const block: Block = {
      id: 'a2ui-interactive',
      type: 'a2ui',
      status: 'completed',
      content: [
        '{"createSurface":{"surfaceId":"controls","catalogId":"default","theme":{}}}',
        `{"updateComponents":{"surfaceId":"controls","components":${JSON.stringify(components)}}}`,
      ].join('\n'),
      metadata: { surfaceId: 'controls', title: 'Interactive Controls' },
    };
    return (
      <Wrapper>
        <A2UIBlock block={block} />
      </Wrapper>
    );
  },
};

export const A2UIMedia: Story = {
  name: 'A2UI Media Gallery',
  render: () => {
    const components = [
      {
        id: 'root',
        type: 'Column',
        children: ['title', 'divider1', 'imgRow', 'divider2', 'iconRow'],
      },
      { id: 'title', type: 'Text', text: 'Media Gallery', variant: 'h3' },
      { id: 'divider1', type: 'Divider' },
      { id: 'imgRow', type: 'Row', gutter: 16, children: ['imgCol1', 'imgCol2'] },
      { id: 'imgCol1', type: 'Column', span: 12, children: ['img1'] },
      {
        id: 'img1',
        type: 'Image',
        url: 'https://picsum.photos/seed/a2ui1/400/300',
        description: 'Landscape photo',
        fit: 'cover',
        width: '100%',
        height: 200,
      },
      { id: 'imgCol2', type: 'Column', span: 12, children: ['img2'] },
      {
        id: 'img2',
        type: 'Image',
        url: 'https://picsum.photos/seed/a2ui2/400/300',
        description: 'Architecture photo',
        fit: 'cover',
        width: '100%',
        height: 200,
      },
      { id: 'divider2', type: 'Divider' },
      {
        id: 'iconRow',
        type: 'Row',
        gutter: 24,
        justify: 'center',
        children: ['ic1', 'ic2', 'ic3', 'ic4'],
      },
      { id: 'ic1', type: 'Column', children: ['icon1'] },
      { id: 'icon1', type: 'Icon', name: 'HomeOutlined', size: 28, color: '#1890ff' },
      { id: 'ic2', type: 'Column', children: ['icon2'] },
      { id: 'icon2', type: 'Icon', name: 'SettingOutlined', size: 28, color: '#52c41a' },
      { id: 'ic3', type: 'Column', children: ['icon3'] },
      { id: 'icon3', type: 'Icon', name: 'BellOutlined', size: 28, color: '#faad14' },
      { id: 'ic4', type: 'Column', children: ['icon4'] },
      { id: 'icon4', type: 'Icon', name: 'UserOutlined', size: 28, color: '#722ed1' },
    ];
    const block: Block = {
      id: 'a2ui-media',
      type: 'a2ui',
      status: 'completed',
      content: [
        '{"createSurface":{"surfaceId":"media","catalogId":"default","theme":{}}}',
        `{"updateComponents":{"surfaceId":"media","components":${JSON.stringify(components)}}}`,
      ].join('\n'),
      metadata: { surfaceId: 'media', title: 'Media Gallery' },
    };
    return (
      <Wrapper>
        <A2UIBlock block={block} />
      </Wrapper>
    );
  },
};

function makeA2UIBlock(
  surfaceId: string,
  title: string,
  status: 'streaming' | 'completed' | 'pending' | 'error',
  components: unknown[]
): Block {
  return {
    id: `a2ui-${surfaceId}`,
    type: 'a2ui',
    status,
    content: [
      `{"createSurface":{"surfaceId":"${surfaceId}","catalogId":"default","theme":{}}}`,
      `{"updateComponents":{"surfaceId":"${surfaceId}","components":${JSON.stringify(components)}}}`,
    ].join('\n'),
    metadata: { surfaceId, title },
  };
}

export const A2UIStreaming: Story = {
  name: 'A2UI Streaming',
  render: () => {
    const components = [
      { id: 'root', type: 'Column', children: ['title', 'progress'] },
      { id: 'title', type: 'Text', text: 'Building surface...', variant: 'h3' },
      { id: 'progress', type: 'Slider', min: 0, max: 100, value: 60, step: 1 },
    ];
    return (
      <Wrapper>
        <A2UIBlock
          block={makeA2UIBlock('stream-demo', 'Live Surface Build', 'streaming', components)}
        />
      </Wrapper>
    );
  },
};

export const A2UIPending: Story = {
  name: 'A2UI Waiting for Interaction',
  render: () => {
    const components = [
      { id: 'root', type: 'Column', children: ['title', 'msg', 'divider1', 'btnRow'] },
      { id: 'title', type: 'Text', text: 'Confirm Deletion', variant: 'h3' },
      {
        id: 'msg',
        type: 'Text',
        text: 'Are you sure you want to delete all project files? This action cannot be undone.',
      },
      { id: 'divider1', type: 'Divider' },
      { id: 'btnRow', type: 'Row', gutter: 12, children: ['bc1', 'bc2'] },
      { id: 'bc1', type: 'Column', children: ['btnCancel'] },
      { id: 'btnCancel', type: 'Button', text: 'Cancel', variant: 'default' },
      { id: 'bc2', type: 'Column', children: ['btnDelete'] },
      { id: 'btnDelete', type: 'Button', text: 'Delete All', variant: 'primary', danger: true },
    ];
    return (
      <Wrapper>
        <A2UIBlock block={makeA2UIBlock('confirm', 'Confirm Action', 'pending', components)} />
      </Wrapper>
    );
  },
};

export const A2UIError: Story = {
  name: 'A2UI Render Error',
  render: () => {
    const components = [
      { id: 'root', type: 'Column', children: ['title', 'unknown'] },
      { id: 'title', type: 'Text', text: 'Broken Component' },
      { id: 'unknown', type: 'FakeType', text: 'This type does not exist' },
    ];
    return (
      <Wrapper>
        <A2UIBlock block={makeA2UIBlock('broken', '', 'error', components)} />
      </Wrapper>
    );
  },
};

// ---- BlocksRenderer (All blocks together) ----

export const AllBlocks: Story = {
  render: () => {
    const a2uiComponents = [
      { id: 'root', type: 'Column', children: ['chartTitle', 'lineChart'] },
      { id: 'chartTitle', type: 'Text', text: 'Revenue Trend', variant: 'h4' },
      {
        id: 'lineChart',
        type: 'Chart',
        chartType: 'line',
        data: [
          { x: '1月', y: 120 },
          { x: '2月', y: 200 },
          { x: '3月', y: 150 },
        ],
        config: { xField: 'x', yField: 'y', smooth: true },
      },
    ];
    const blocks: Block[] = [
      {
        id: 'b1',
        type: 'thinking',
        status: 'completed',
        content: '分析用户需求：搜索 AI 新闻，需要并行调用多个来源...',
      },
      {
        id: 'b2',
        type: 'plan',
        status: 'streaming',
        content: '',
        metadata: {
          steps: [
            { content: '解析用户意图', status: 'completed' },
            { content: '生成搜索计划', status: 'completed' },
            { content: '执行工具调用', status: 'running' },
            { content: '汇总生成回复', status: 'pending' },
          ],
        },
      },
      {
        id: 'b3',
        type: 'tool_call',
        status: 'completed',
        content: '',
        metadata: {
          toolName: 'web_search',
          toolType: 'builtin',
          toolArgs: '{"query": "AI news 2026", "limit": 10}',
          toolResult: '3 sources returned, 24 articles found\nDuration: 2.4s',
        },
      },
      {
        id: 'b4',
        type: 'human_input',
        status: 'completed',
        content: '',
        metadata: {
          requestId: 'req-1',
          inputType: 'confirmation',
          title: '费用确认',
          response: true,
        },
      },
      {
        id: 'b5',
        type: 'skill',
        status: 'completed',
        content: '已整理 3 条最新 AI 新闻。',
        metadata: {
          skillName: 'ai-news',
          phase: 'completed',
        },
      },
      makeA2UIBlock('chart-1', '趋势图', 'completed', a2uiComponents),
    ];
    return (
      <Wrapper>
        <BlocksRenderer blocks={blocks} />
      </Wrapper>
    );
  },
};

export const FullConversation: Story = {
  render: () => {
    const blocks: Block[] = [
      {
        id: 't1',
        type: 'thinking',
        status: 'streaming',
        content: '用户想要搜索 AI 新闻，我需要并行调用 web_search 工具...',
      },
      {
        id: 'p1',
        type: 'plan',
        status: 'streaming',
        content: '',
        metadata: {
          steps: [
            { content: '解析用户意图', status: 'completed' },
            { content: '生成搜索计划', status: 'running' },
            { content: '执行工具调用', status: 'pending' },
            { content: '等待用户确认', status: 'pending' },
            { content: '汇总生成回复', status: 'pending' },
          ],
        },
      },
      {
        id: 'tc1',
        type: 'tool_call',
        status: 'streaming',
        content: '',
        metadata: {
          toolName: 'web_search',
          toolType: 'builtin',
          toolArgs: '{"query": "AI artificial intelligence news 2026"}',
        },
      },
      {
        id: 'hi1',
        type: 'human_input',
        status: 'pending',
        content: '',
        metadata: {
          requestId: 'req-cost',
          inputType: 'confirmation',
          title: '费用确认',
          message: '本次搜索将调用 3 个外部 API，预计消耗约 0.02 USD，是否继续？',
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
