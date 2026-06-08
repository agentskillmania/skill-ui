import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkillCard } from './SkillCard.js';

const meta: Meta<typeof SkillCard> = {
  title: 'Portal/SkillCard',
  component: SkillCard,
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SkillCard>;

const baseSkill = {
  id: 'skill-1',
  name: 'Web Search',
  description: 'Search the web for real-time information.',
};

export const Default: Story = {
  args: {
    skill: baseSkill,
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const LongDescription: Story = {
  args: {
    skill: {
      ...baseSkill,
      description:
        'This skill allows the agent to search the web using multiple search engines and synthesize results into a coherent answer.',
    },
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Ellipsis: Story = {
  args: {
    skill: {
      ...baseSkill,
      name: 'Super Long Skill Name That Will Definitely Overflow The Card Width',
      description:
        'This is an extremely long description that will definitely exceed the available width and trigger the ellipsis overflow behavior with a tooltip on hover.',
    },
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};
