import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { SkillBlock } from '../../src/blocks/SkillBlock.js';
import type { Block } from '../../src/types.js';

/** Base skill block template */
const baseSkillBlock: Block = {
  id: 'sk1',
  type: 'skill',
  status: 'streaming',
  content: '',
  metadata: {
    skillName: 'web-search',
    phase: 'loading',
  },
};

describe('SkillBlock', () => {
  it('loading phase shows loading', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('加载技能: web-search...')).toBeInTheDocument();
    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('loaded phase shows token count', () => {
    const loadedBlock: Block = {
      ...baseSkillBlock,
      metadata: { skillName: 'web-search', phase: 'loaded', tokenCount: 1500 },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={loadedBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search（1500 tokens）')).toBeInTheDocument();
    expect(screen.getByText('已加载')).toBeInTheDocument();
  });

  it('executing phase shows executing and task description', () => {
    const executingBlock: Block = {
      ...baseSkillBlock,
      metadata: { skillName: 'web-search', phase: 'executing', task: '搜索 AI 新闻' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={executingBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('执行技能: web-search')).toBeInTheDocument();
    expect(screen.getByText('搜索 AI 新闻')).toBeInTheDocument();
  });

  it('completed phase shows completed', () => {
    const completedBlock: Block = {
      ...baseSkillBlock,
      status: 'completed',
      metadata: { skillName: 'web-search', phase: 'completed' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={completedBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search 完成')).toBeInTheDocument();
  });

  it('error status shows failure message', () => {
    const errorBlock: Block = {
      ...baseSkillBlock,
      status: 'error',
      content: '加载失败',
    };
    render(
      <ChatWrapper>
        <SkillBlock block={errorBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search 执行失败')).toBeInTheDocument();
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('renders content text when content exists', () => {
    const block: Block = {
      ...baseSkillBlock,
      content: '搜索结果: AI 技术发展迅速',
      metadata: { skillName: 'web-search', phase: 'completed' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={block} />
      </ChatWrapper>
    );
    expect(screen.getByText('搜索结果: AI 技术发展迅速')).toBeInTheDocument();
  });

  it('does not render content area when no content', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    // only title area, no content text
    expect(screen.getByText('加载技能: web-search...')).toBeInTheDocument();
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
  });

  it('uses default skill name when no skillName', () => {
    const noName: Block = {
      ...baseSkillBlock,
      metadata: { phase: 'loading' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={noName} />
      </ChatWrapper>
    );
    expect(screen.getByText('加载技能: 技能...')).toBeInTheDocument();
  });

  it('shows 0 when no tokenCount in loaded phase', () => {
    const loadedBlock: Block = {
      ...baseSkillBlock,
      metadata: { phase: 'loaded' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={loadedBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('技能（0 tokens）')).toBeInTheDocument();
  });

  it('tag shows executing when no task in executing phase', () => {
    const executingBlock: Block = {
      ...baseSkillBlock,
      metadata: { skillName: 'web-search', phase: 'executing' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={executingBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('执行中')).toBeInTheDocument();
  });

  it('does not show tag in completed phase', () => {
    const completedBlock: Block = {
      ...baseSkillBlock,
      status: 'completed',
      metadata: { skillName: 'web-search', phase: 'completed' },
    };
    render(
      <ChatWrapper>
        <SkillBlock block={completedBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('web-search 完成')).toBeInTheDocument();
    // should not have tag element
    expect(screen.queryByText('已完成')).not.toBeInTheDocument();
  });
});
