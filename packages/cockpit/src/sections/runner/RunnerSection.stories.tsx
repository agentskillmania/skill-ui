/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { RunnerSection } from './RunnerSection.js';
import type { RunnerDiagnosticsData } from './types.js';

const meta: Meta<typeof RunnerSection> = {
  title: 'Cockpit/RunnerSection',
  component: RunnerSection,
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: 360, padding: 16 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RunnerSection>;

/** Empty — no runner data. */
export const Empty: Story = {
  args: {},
};

/** Features only — shows feature toggles. */
export const FeaturesOnly: Story = {
  args: {
    runner: {
      features: {
        sandbox: true,
        thinkingEnabled: false,
        enablePromptThinking: false,
        a2uiEnabled: true,
        compressorEnabled: true,
        enableSession: true,
        enableTodolist: false,
        enableCommands: true,
      },
      tools: null,
      skills: null,
    },
  },
};

/** Tools only — grouped tool list. */
export const ToolsOnly: Story = {
  args: {
    runner: {
      features: null,
      tools: [
        {
          name: 'file_read',
          description:
            'Read file contents from local filesystem with encoding detection and streaming support for large files',
          type: 'builtin',
          enabled: true,
        },
        {
          name: 'file_write',
          description:
            'Write content to a file on disk, creating parent directories if needed. Supports atomic writes with temp file + rename pattern',
          type: 'builtin',
          enabled: true,
        },
        {
          name: 'shell',
          description:
            'Execute arbitrary shell commands within a sandboxed environment with configurable timeout and output capture',
          type: 'builtin',
          enabled: false,
        },
        {
          name: 'web_search',
          description: 'Search the web',
          type: 'builtin',
          enabled: true,
        },
        {
          name: 'mcp_github',
          description:
            'Full GitHub API integration including issues, PRs, code search, and repository management across organizations',
          type: 'mcp',
          enabled: true,
        },
        {
          name: 'mcp_slack',
          description: 'Slack workspace integration',
          type: 'mcp',
          enabled: true,
        },
        {
          name: 'ask_human',
          description:
            'Ask human for input or confirmation during agent execution, with configurable timeout and default response behavior',
          type: 'session',
          enabled: true,
        },
        {
          name: 'todo_add',
          description: 'Add a todo item',
          type: 'todolist',
          enabled: true,
        },
        {
          name: 'todo_list',
          description:
            'List all todo items with status filtering, priority sorting, and optional tag-based grouping for project management',
          type: 'todolist',
          enabled: true,
        },
        {
          name: 'custom_tool',
          description: 'A custom extra tool',
          type: 'extra',
          enabled: true,
        },
      ],
      skills: null,
    },
  },
};

/** Skills only — skill list with sources. */
export const SkillsOnly: Story = {
  args: {
    runner: {
      features: null,
      tools: null,
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
        { name: 'code-review', description: 'Review code quality', source: '/skills/code-review' },
      ],
    },
  },
};

/** Full — all data populated. */
export const Full: Story = {
  args: {
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
        {
          name: 'file_read',
          description: 'Read file contents from local filesystem with encoding detection',
          type: 'builtin',
          enabled: true,
        },
        {
          name: 'file_write',
          description: 'Write content to a file on disk, creating parent directories if needed',
          type: 'builtin',
          enabled: true,
        },
        {
          name: 'shell',
          description: 'Execute arbitrary shell commands within a sandboxed environment',
          type: 'builtin',
          enabled: false,
        },
        {
          name: 'mcp_github',
          description:
            'Full GitHub API integration including issues, PRs, code search, and repository management',
          type: 'mcp',
          enabled: true,
        },
        {
          name: 'ask_human',
          description: 'Ask human for input or confirmation during agent execution',
          type: 'session',
          enabled: true,
        },
        {
          name: 'todo_add',
          description: 'Add a new todo item to the list with priority and tags',
          type: 'todolist',
          enabled: true,
        },
        {
          name: 'todo_list',
          description: 'List all todo items with status filtering and priority sorting',
          type: 'todolist',
          enabled: true,
        },
        {
          name: 'a2ui_render',
          description: 'Render A2UI interactive surface',
          type: 'a2ui',
          enabled: true,
        },
      ],
      skills: [
        { name: 'spec-plan', description: 'Plan specifications', source: '/skills/spec-plan' },
        {
          name: 'a2ui-generation',
          description: 'Generate A2UI',
          source: '/skills/a2ui-generation',
        },
      ],
    } satisfies RunnerDiagnosticsData,
  },
};
