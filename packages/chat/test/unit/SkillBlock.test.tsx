import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { SkillBlock } from '../../src/blocks-redesign/SkillBlock.js';
import type { Block } from '../../src/types.js';

/** Base skill block template — load_skill tool call, mid-flight */
const baseSkillBlock: Block = {
  id: 'sk1',
  type: 'skill',
  status: 'streaming',
  content: '',
  metadata: {
    skillName: 'web-search',
  },
};

describe('SkillBlock', () => {
  it('streaming status shows skill name and loading badge', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search')).toBeInTheDocument();
    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('completed status shows loaded badge', () => {
    const block: Block = {
      ...baseSkillBlock,
      status: 'completed',
      metadata: { skillName: 'web-search' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search')).toBeInTheDocument();
    expect(screen.getByText('已加载')).toBeInTheDocument();
  });

  it('error status shows failure badge and stays informative', () => {
    const block: Block = {
      ...baseSkillBlock,
      status: 'error',
      content: '加载失败',
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search')).toBeInTheDocument();
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('shows task description as subtitle when present', () => {
    const block: Block = {
      ...baseSkillBlock,
      metadata: { skillName: 'web-search', task: '搜索 AI 新闻' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('搜索 AI 新闻')).toBeInTheDocument();
  });

  it('does not render a subtitle when task is absent', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search')).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it('renders content text when content exists', () => {
    const block: Block = {
      ...baseSkillBlock,
      content: '搜索结果: AI 技术发展迅速',
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('搜索结果: AI 技术发展迅速')).toBeInTheDocument();
  });

  it('derives the result preview from metadata.result when content is empty (new state shape)', () => {
    const block: Block = {
      ...baseSkillBlock,
      content: '',
      metadata: { skillName: 'web-search', result: 'x'.repeat(250) },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    // Same preview the state layer used to bake: `Result: ` + first 200 chars
    expect(screen.getByText(`Result: ${'x'.repeat(200)}`)).toBeInTheDocument();
  });

  it('prefers baked content over metadata.result (legacy archives)', () => {
    const block: Block = {
      ...baseSkillBlock,
      content: 'Result: 旧存档内容',
      metadata: { skillName: 'web-search', result: 'ignored' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('Result: 旧存档内容')).toBeInTheDocument();
    expect(screen.queryByText(/ignored/)).not.toBeInTheDocument();
  });

  it('does not render content area when no content and no result', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search')).toBeInTheDocument();
    expect(screen.queryByText(/Result:/)).not.toBeInTheDocument();
  });

  it('uses default skill name when no metadata', () => {
    const noMeta: Block = {
      id: 'sk-nm',
      type: 'skill',
      status: 'streaming',
      content: '',
    };
    render(
      <ChatWrapper>
        <SkillBlock block={noMeta} />
      </ChatWrapper>
    );
    expect(screen.getByText('技能')).toBeInTheDocument();
    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('uses default skill name when no skillName', () => {
    const noName: Block = {
      ...baseSkillBlock,
      metadata: {},
    };
    render(
      <ChatWrapper>
        <SkillBlock block={noName} />
      </ChatWrapper>
    );
    expect(screen.getByText('技能')).toBeInTheDocument();
  });
});
