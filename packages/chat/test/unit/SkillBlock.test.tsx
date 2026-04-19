import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { SkillBlock } from '../../src/blocks/SkillBlock.js';
import type { Block } from '../../src/types.js';

/** 基础 skill block 模板 */
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
  it('loading 阶段显示加载中', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    expect(screen.getByText('加载技能: web-search...')).toBeInTheDocument();
    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('loaded 阶段显示 token 数量', () => {
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

  it('executing 阶段显示执行中和任务描述', () => {
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

  it('completed 阶段显示完成', () => {
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

  it('error 状态显示失败信息', () => {
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

  it('有 content 时渲染内容文本', () => {
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

  it('无 content 时不渲染内容区域', () => {
    render(
      <ChatWrapper>
        <SkillBlock block={baseSkillBlock} />
      </ChatWrapper>
    );
    // 只有标题区域，没有内容文本
    expect(screen.getByText('加载技能: web-search...')).toBeInTheDocument();
  });

  it('无 metadata 时使用默认技能名称', () => {
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

  it('无 skillName 时使用默认技能名称', () => {
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

  it('loaded 阶段无 tokenCount 时显示 0', () => {
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

  it('executing 阶段无 task 时标签显示执行中', () => {
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

  it('completed 阶段不显示 tag', () => {
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
    // 不应有 tag 元素
    expect(screen.queryByText('已完成')).not.toBeInTheDocument();
  });
});
