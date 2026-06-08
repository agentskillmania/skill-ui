/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { AgentStateSection } from './AgentStateSection.js';
import type { AgentStateSectionProps } from './types.js';

/** Reference time for relative timestamps in stories. */
const NOW = Date.now();

const meta: Meta<typeof AgentStateSection> = {
  title: 'Cockpit/AgentStateSection',
  component: AgentStateSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: 380, padding: 16 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<AgentStateSectionProps>;

/** All cards empty — initial state before any activity. */
export const Empty: Story = {
  args: {
    skillState: null,
    compression: null,
    llm: null,
  },
};

/** Active skill with a nested call stack. */
export const ActiveSkill: Story = {
  args: {
    skillState: {
      current: 'execute-plan',
      stack: [
        { skillName: 'code-review', loadedAt: NOW - 45000 },
        { skillName: 'analyze-repo', loadedAt: NOW - 120000 },
      ],
      loadedInstructions:
        'You are code-reviewer, an expert code review agent.\n\n## Available skills:\n- code-review: Automated code review\n- execute-plan: Execute an approved plan\n\nWhen you COMPLETE your task, you MUST call the return_skill tool.',
    },
    compression: null,
    llm: null,
  },
};

/** Compression state after context was compressed. */
export const Compression: Story = {
  args: {
    skillState: null,
    compression: {
      summary:
        'Fixed 2 unused imports and 1 any type in types.ts and eventRows.tsx. Also resolved test failures related to the Progress component migration.',
      anchor: 42,
      removedTokenCount: 8200,
      summaryTokenCount: 320,
      compressedAt: NOW - 180000,
    },
    llm: null,
  },
};

/** Last LLM request with system prompt. */
export const LLMContext: Story = {
  args: {
    skillState: null,
    compression: null,
    llm: {
      messages: [
        {
          role: 'system',
          content:
            'You are code-reviewer, an expert code review agent.\n\n## Available skills:\n- code-review: Automated code review\n- execute-plan: Execute an approved plan\n- test-gen: Generate unit tests\n\nYou are currently executing the \'execute-plan\' skill.\n\nWhen you COMPLETE your task, you MUST call the return_skill tool.',
        },
        { role: 'user', content: 'Help me debug the test failure' },
        { role: 'assistant', content: 'I see the issue.' },
        { role: 'user', content: 'Can you fix it?' },
      ],
      tools: [
        { name: 'ReadFile' },
        { name: 'WriteFile' },
        { name: 'SearchFiles' },
        { name: 'RunTests' },
        { name: 'GitCommit' },
      ],
    },
  },
};

/** All three cards populated — typical active session state. */
export const Full: Story = {
  args: {
    skillState: {
      current: 'execute-plan',
      stack: [
        { skillName: 'code-review', loadedAt: NOW - 45000 },
        { skillName: 'analyze-repo', loadedAt: NOW - 120000 },
      ],
      loadedInstructions:
        'You are code-reviewer, an expert code review agent.\n\n## Available skills:\n- code-review\n- execute-plan\n\nWhen you COMPLETE your task, you MUST call the return_skill tool.',
    },
    compression: {
      summary:
        'Fixed 2 unused imports and 1 any type in types.ts and eventRows.tsx.',
      anchor: 42,
      removedTokenCount: 8200,
      summaryTokenCount: 320,
      compressedAt: NOW - 180000,
    },
    llm: {
      messages: [
        {
          role: 'system',
          content:
            'You are code-reviewer.\n\n## Skills:\n- code-review\n- execute-plan\n\nExecuting \'execute-plan\'.',
        },
        { role: 'user', content: 'Fix the test' },
        { role: 'assistant', content: 'Done.' },
      ],
      tools: [{ name: 'ReadFile' }, { name: 'WriteFile' }, { name: 'RunTests' }],
    },
  },
};
