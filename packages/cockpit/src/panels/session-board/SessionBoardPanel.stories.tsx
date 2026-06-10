import type { Meta, StoryObj } from '@storybook/react-vite';
import { SessionBoardPanel } from './SessionBoardPanel.js';
import type { SessionBoardData } from '../../types.js';

const mockState: SessionBoardData = {
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
    ],
    skills: [
      {
        name: 'spec-plan',
        description: 'Plan and execute specifications',
        source: '/skills/spec-plan',
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
      { role: 'system', content: 'You are a code review agent.' },
      { role: 'user', content: 'Fix the test failure' },
    ],
    tools: [{ name: 'ReadFile' }, { name: 'WriteFile' }],
  },
  systemPrompt: 'You are a code review agent with execute-plan skill loaded.',
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

const meta: Meta<typeof SessionBoardPanel> = {
  title: 'Cockpit/Panels/SessionBoardPanel',
  component: SessionBoardPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '400px', width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SessionBoardPanel>;

export const WithData: Story = {
  args: {
    state: mockState,
  },
};

export const Empty: Story = {
  args: {},
};
