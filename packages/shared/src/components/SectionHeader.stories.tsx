import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cpu, Wrench, Settings } from 'lucide-react';
import { SectionHeader } from './SectionHeader.js';
import type { SectionHeaderProps } from './SectionHeader.js';

const meta: Meta<typeof SectionHeader> = {
  title: 'Shared/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<SectionHeaderProps>;

/** Default section header with icon and title. */
export const Default: Story = {
  args: {
    icon: Cpu,
    title: 'Agent State',
  },
};

/** Section header with extra content aligned to the right. */
export const WithExtra: Story = {
  args: {
    icon: Wrench,
    title: 'Skills',
    extra: <span>3 active</span>,
  },
};

/** Multiple headers stacked to demonstrate the divider pattern. */
export const MultipleHeaders: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader icon={Cpu} title="Agent State" />
      <SectionHeader icon={Wrench} title="Skills" extra={<span>3 active</span>} />
      <SectionHeader icon={Settings} title="Configuration" />
    </div>
  ),
};
