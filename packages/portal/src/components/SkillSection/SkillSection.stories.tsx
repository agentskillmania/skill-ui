import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SkillSection } from './SkillSection.js';

const meta: Meta<typeof SkillSection> = {
  title: 'Portal/SkillSection',
  component: SkillSection,
  decorators: [
    (Story) => (
      <ConfigProvider theme={lightAntdConfig}>
        <ThemeProvider theme={lightTheme}>
          <Story />
        </ThemeProvider>
      </ConfigProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SkillSection>;

const mockSkills = Array.from({ length: 6 }, (_, i) => ({
  id: `skill-${i}`,
  name: `Skill ${i + 1}`,
  description: `Description for skill ${i + 1}`,
  source: 'custom' as const,
}));

export const Default: Story = {
  args: {
    skills: mockSkills,
    page: 1,
    total: mockSkills.length,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export const Empty: Story = {
  args: {
    skills: [],
    page: 1,
    total: 0,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export const WithPagination: Story = {
  args: {
    skills: mockSkills.slice(0, 3),
    page: 1,
    pageSize: 3,
    total: 20,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};
