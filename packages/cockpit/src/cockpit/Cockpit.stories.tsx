/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cockpit } from './index.js';
import type { Message } from '@agentskillmania/skill-ui-chat';
import type { CockpitEvent } from '../panels/event-log/types.js';
import type { SessionBoardData, SessionInfo } from '../types.js';

const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Help me debug the test failure', status: 'completed' },
  {
    id: '2',
    role: 'assistant',
    content: 'I see the issue. The test expects antd Progress.',
    status: 'completed',
  },
  { id: '3', role: 'user', content: 'Can you fix it?', status: 'completed' },
];

const mockEvents: CockpitEvent[] = [
  { id: '1', timestamp: 1000, type: 'step:start', label: '', payload: { step: 1 } },
  {
    id: '2',
    timestamp: 1200,
    type: 'phase-change',
    label: '',
    payload: { from: 'preparing', to: 'calling-llm' },
  },
  {
    id: '3',
    timestamp: 1500,
    type: 'llm:request',
    label: '',
    payload: {
      messages: [{ role: 'user', content: 'Debug' }],
      tools: ['ReadFile', 'SearchFiles', 'WriteFile'],
    },
  },
  {
    id: '4',
    timestamp: 2000,
    type: 'thinking',
    label: '',
    payload: {
      content:
        'The test expects antd Progress component but we removed it. Let me check the imports and fix the test accordingly.',
    },
  },
  {
    id: '5',
    timestamp: 3000,
    type: 'llm:response',
    label: '',
    payload: {
      text: 'I see the issue. Let me read the test file first.',
      toolCalls: [{ id: 'c1', name: 'ReadFile', arguments: { path: '/test.ts' } }],
    },
  },
  {
    id: '6',
    timestamp: 3100,
    type: 'tool:start',
    label: '',
    payload: { name: 'ReadFile', callId: 'c1' },
  },
  {
    id: '7',
    timestamp: 3500,
    type: 'tool:end',
    label: '',
    payload: {
      callId: 'c1',
      name: 'ReadFile',
      result: 'test file contents here with all the test cases...',
    },
  },
  {
    id: '8',
    timestamp: 4000,
    type: 'tool:start',
    label: '',
    payload: { name: 'SearchFiles', callId: 'c2' },
  },
  {
    id: '9',
    timestamp: 5000,
    type: 'tool:end',
    label: '',
    payload: { callId: 'c2', name: 'SearchFiles', result: '3 matches found in test directory' },
  },
  { id: '10', timestamp: 5500, type: 'skill:loading', label: '', payload: { name: 'code-review' } },
  {
    id: '11',
    timestamp: 5800,
    type: 'skill:loaded',
    label: '',
    payload: { name: 'code-review', tokenCount: 2400 },
  },
  {
    id: '12',
    timestamp: 5900,
    type: 'skill:start',
    label: '',
    payload: { name: 'code-review', task: 'Review all recent changes for quality issues' },
  },
  {
    id: '13',
    timestamp: 6100,
    type: 'subagent:start',
    label: '',
    payload: { name: 'reviewer', task: 'Check for unused imports and type safety' },
  },
  {
    id: '14',
    timestamp: 7500,
    type: 'subagent:end',
    label: '',
    payload: { name: 'reviewer', result: 'Found 2 unused imports and 1 any type' },
  },
  {
    id: '15',
    timestamp: 7600,
    type: 'skill:end',
    label: '',
    payload: { name: 'code-review', result: 'Review complete, 3 issues found' },
  },
  { id: '16', timestamp: 8000, type: 'step:end', label: '', payload: { step: 1 } },
  { id: '17', timestamp: 8100, type: 'step:start', label: '', payload: { step: 2 } },
  {
    id: '18',
    timestamp: 8200,
    type: 'phase-change',
    label: '',
    payload: { from: 'preparing', to: 'calling-llm' },
  },
  {
    id: '19',
    timestamp: 8500,
    type: 'llm:request',
    label: '',
    payload: {
      messages: [
        { role: 'assistant', content: 'Review done' },
        { role: 'user', content: 'Fix them' },
      ],
      tools: ['WriteFile', 'ReadFile'],
      skill: { current: 'code-review', stack: ['code-review'] },
    },
  },
  {
    id: '20',
    timestamp: 9000,
    type: 'thinking',
    label: '',
    payload: {
      content:
        'I need to remove the unused imports from types.ts and fix the any type in eventRows.tsx...',
    },
  },
  {
    id: '21',
    timestamp: 10000,
    type: 'llm:response',
    label: '',
    payload: {
      text: 'Fixing now.',
      toolCalls: [
        { id: 'c3', name: 'WriteFile', arguments: { path: '/types.ts' } },
        { id: 'c4', name: 'WriteFile', arguments: { path: '/eventRows.tsx' } },
      ],
    },
  },
  {
    id: '22',
    timestamp: 10100,
    type: 'tool:start',
    label: '',
    payload: { name: 'WriteFile', callId: 'c3' },
  },
  {
    id: '23',
    timestamp: 10500,
    type: 'tool:end',
    label: '',
    payload: { callId: 'c3', name: 'WriteFile', result: 'File written successfully' },
  },
  {
    id: '24',
    timestamp: 10600,
    type: 'tool:start',
    label: '',
    payload: { name: 'WriteFile', callId: 'c4' },
  },
  {
    id: '25',
    timestamp: 11000,
    type: 'tool:end',
    label: '',
    payload: { callId: 'c4', name: 'WriteFile', result: 'File written successfully' },
  },
  { id: '26', timestamp: 11500, type: 'compressing', label: '' },
  {
    id: '27',
    timestamp: 12000,
    type: 'compressed',
    label: '',
    payload: {
      summary: 'Fixed 2 unused imports and 1 any type in types.ts and eventRows.tsx',
      removedCount: 8,
    },
  },
  { id: '28', timestamp: 12100, type: 'step:end', label: '', payload: { step: 2 } },
  { id: '29', timestamp: 12200, type: 'step:start', label: '', payload: { step: 3 } },
  {
    id: '30',
    timestamp: 12300,
    type: 'skill:loading',
    label: '',
    payload: { name: 'test-runner' },
  },
  {
    id: '31',
    timestamp: 12600,
    type: 'skill:loaded',
    label: '',
    payload: { name: 'test-runner', tokenCount: 800 },
  },
  {
    id: '32',
    timestamp: 12700,
    type: 'skill:start',
    label: '',
    payload: { name: 'test-runner', task: 'Run unit tests and verify fixes' },
  },
  {
    id: '33',
    timestamp: 13000,
    type: 'tool:start',
    label: '',
    payload: { name: 'RunTests', callId: 'c5' },
  },
  {
    id: '34',
    timestamp: 16000,
    type: 'tool:end',
    label: '',
    payload: { callId: 'c5', name: 'RunTests', result: '12 tests passed, 0 failed' },
  },
  {
    id: '35',
    timestamp: 16100,
    type: 'skill:end',
    label: '',
    payload: { name: 'test-runner', result: 'All tests passing' },
  },
  {
    id: '36',
    timestamp: 16200,
    type: 'subagent:start',
    label: '',
    payload: { name: 'validator', task: 'Verify no regressions in other packages' },
  },
  {
    id: '37',
    timestamp: 18000,
    type: 'subagent:end',
    label: '',
    payload: { name: 'validator', result: 'No regressions detected' },
  },
  {
    id: '38',
    timestamp: 18500,
    type: 'waiting-human',
    label: '',
    payload: { request: { question: 'Changes look good. Should I commit?' } },
  },
  {
    id: '39',
    timestamp: 20000,
    type: 'error',
    label: '',
    payload: { message: 'Network timeout on lint check' },
  },
  { id: '40', timestamp: 21000, type: 'step:end', label: '', payload: { step: 3 } },
  { id: '41', timestamp: 22000, type: 'step:start', label: '', payload: { step: 4 } },
  {
    id: '42',
    timestamp: 22100,
    type: 'llm:request',
    label: '',
    payload: { messages: [{ role: 'user', content: 'Commit the changes' }], tools: ['GitCommit'] },
  },
  {
    id: '43',
    timestamp: 23000,
    type: 'llm:response',
    label: '',
    payload: { text: 'Committing all fixes now.' },
  },
  {
    id: '44',
    timestamp: 23100,
    type: 'tool:start',
    label: '',
    payload: { name: 'GitCommit', callId: 'c6' },
  },
  {
    id: '45',
    timestamp: 23500,
    type: 'tool:end',
    label: '',
    payload: {
      callId: 'c6',
      name: 'GitCommit',
      result: 'Committed: fix: remove unused imports and fix any type',
    },
  },
  { id: '46', timestamp: 24000, type: 'step:end', label: '', payload: { step: 4 } },
  { id: '47', timestamp: 25000, type: 'complete', label: '' },
];

const mockSessionBoardState: SessionBoardData = {
  runner: {
    features: {
      sandbox: true,
      thinkingEnabled: true,
      enablePromptThinking: false,
      a2uiEnabled: true,
      compressorEnabled: true,
      enableSession: true,
      enableTodolist: true,
      enableCommands: true,
    },
    tools: [
      { name: 'file_read', description: 'Read file contents', type: 'builtin', enabled: true },
      { name: 'file_write', description: 'Write to a file', type: 'builtin', enabled: true },
      { name: 'file_edit', description: 'Edit file contents', type: 'builtin', enabled: true },
      { name: 'glob', description: 'Find files by pattern', type: 'builtin', enabled: true },
      { name: 'grep', description: 'Search file contents', type: 'builtin', enabled: true },
      { name: 'shell', description: 'Execute shell commands', type: 'builtin', enabled: false },
      { name: 'web_search', description: 'Search the web', type: 'builtin', enabled: true },
      { name: 'web_fetch', description: 'Fetch web pages', type: 'builtin', enabled: true },
      { name: 'mcp_github', description: 'GitHub API integration', type: 'mcp', enabled: true },
      { name: 'mcp_slack', description: 'Slack integration', type: 'mcp', enabled: true },
      { name: 'ask_human', description: 'Ask human for input', type: 'session', enabled: true },
      { name: 'calculator', description: 'Evaluate expressions', type: 'session', enabled: true },
      { name: 'todo_add', description: 'Add a todo item', type: 'todolist', enabled: true },
      { name: 'todo_list', description: 'List todo items', type: 'todolist', enabled: true },
      { name: 'a2ui_render', description: 'Render A2UI surface', type: 'a2ui', enabled: true },
    ],
    skills: [
      {
        name: 'spec-plan',
        description: 'Plan and execute specifications',
        source: '/skills/spec-plan',
      },
      {
        name: 'a2ui-generation',
        description: 'Generate A2UI components',
        source: '/skills/a2ui-generation',
      },
    ],
  },
  agent: {
    context: {
      skillState: {
        current: 'execute-plan',
        stack: [
          { skillName: 'code-review', loadedAt: Date.now() - 45000 },
          { skillName: 'analyze-repo', loadedAt: Date.now() - 120000 },
        ],
        loadedInstructions: 'You are executing the execute-plan skill.',
      },
      compression: {
        summary: 'Fixed 2 unused imports and 1 any type in types.ts and eventRows.tsx',
        anchor: 10,
        removedTokenCount: 8200,
        summaryTokenCount: 320,
        compressedAt: Date.now() - 180000,
      },
    },
  },
  llm: {
    messages: [
      {
        role: 'system',
        content:
          "You are a code review agent.\n\n## Available skills:\n- code-review\n- execute-plan\n\nYou are currently executing the 'execute-plan' skill.",
      },
      { role: 'user', content: 'Fix the test failure' },
    ],
    tools: [{ name: 'ReadFile' }, { name: 'WriteFile' }, { name: 'SearchFiles' }],
  },
  systemPrompt:
    "You are a code review agent.\n\n## Available skills:\n- code-review\n- execute-plan\n\nYou are currently executing the 'execute-plan' skill.",
  session: {
    overview: {
      title: 'Fix auth bug',
      agentName: 'Claude',
      model: 'claude-sonnet-4-6',
      stepCount: 3,
      messageCount: 12,
      tokensIn: 8000,
      tokensOut: 1500,
      tokensTotal: 9500,
      estimatedContextSize: 12000,
      contextWindow: 200000,
      status: 'running',
      createdAt: '2026-06-05T10:00:00Z',
      updatedAt: '2026-06-05T10:30:00Z',
    },
    info: {
      sessionId: 'sess-123-abc',
      agentName: 'Claude',
      agentConfigPath: '/workspace/.agentskillmania/agents/claude.md',
      model: 'claude-sonnet-4-6',
      tokensIn: 8000,
      tokensOut: 1500,
      tokensTotal: 9500,
      workspacePath: '/workspace/project',
      sessionPath: '/workspace/.agentskillmania/sessions/sess-123',
      skillDirs: ['/workspace/skills', '/home/user/.agentskillmania/skills'],
      mcpConfigPaths: ['/workspace/.agentskillmania/mcp.json'],
    },
  },
};

const mockSessions: SessionInfo[] = [
  {
    id: '1',
    agentName: 'debug-agent',
    model: 'claude-sonnet-4-6',
    workspacePath: '/project-a',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: '2',
    agentName: 'code-reviewer',
    model: 'gpt-4o',
    workspacePath: '/project-a',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    agentName: 'data-pipeline',
    model: 'claude-sonnet-4-6',
    workspacePath: '/project-b',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '4',
    agentName: 'test-runner',
    model: 'claude-haiku-4-5',
    workspacePath: '/project-a',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '5',
    agentName: 'deploy-bot',
    model: 'gpt-4o',
    workspacePath: '/project-c',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const meta: Meta<typeof Cockpit> = {
  title: 'Cockpit/Cockpit',
  component: Cockpit,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Cockpit>;

export const Default: Story = {
  args: {
    chatMessages: mockMessages,
    chatInputValue: '',
    onChatInputChange: () => {},
    chatStatus: 'streaming',
    eventLogEvents: mockEvents,
    sessionBoardState: mockSessionBoardState,
    sessionsSessions: mockSessions,
    sessionsActiveId: '1',
  },
};

export const CollapsedSidebar: Story = {
  args: {
    chatMessages: mockMessages,
    chatInputValue: '',
    onChatInputChange: () => {},
    chatStatus: 'idle',
    eventLogEvents: mockEvents,
    sessionBoardState: mockSessionBoardState,
    sessionsSessions: mockSessions,
    sessionsActiveId: '1',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const NoData: Story = {
  args: {
    chatMessages: [],
    chatInputValue: '',
    onChatInputChange: () => {},
    chatStatus: 'idle',
    eventLogEvents: [],
    sessionsSessions: [],
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};
