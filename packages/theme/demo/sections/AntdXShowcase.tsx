import { css } from '@emotion/react';
import { ConfigProvider, Avatar } from 'antd';
import { XProvider, Bubble, Sender, ThoughtChain, Think } from '@ant-design/x';
import type { Theme } from '../../src/index';
import { createAntdConfig, getAntdXTokens } from '../../src/index';

const thoughtChainItems = [
  {
    title: '分析需求',
    description: '理解用户意图，提取关键信息',
    status: 'success' as const,
  },
  {
    title: '检索知识',
    description: '从知识库中匹配相关文档',
    status: 'success' as const,
  },
  {
    title: '生成回答',
    description: '基于检索结果组织回复',
    status: 'pending' as const,
  },
];

export function AntdXShowcase({ theme, mode }: { theme: Theme; mode: 'light' | 'dark' }) {
  const antdConfig = createAntdConfig(theme);
  const xTokens = getAntdXTokens(theme);

  return (
    <ConfigProvider theme={antdConfig}>
      <XProvider theme={mode === 'dark' ? { token: xTokens } : { token: xTokens }}>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[6]};
          `}
        >
          {/* Bubble */}
          <div>
            <h3 css={labelStyle(theme)}>Bubble（聊天气泡）</h3>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                gap: ${theme.spacing[3]};
                max-width: 500px;
              `}
            >
              <Bubble
                placement="start"
                avatar={<Avatar style={{ background: theme.color.primary }}>AI</Avatar>}
                content="你好，我是 AI 助手。有什么可以帮你的吗？"
                styles={{ content: { background: theme.color.bgElevated } }}
              />
              <Bubble placement="end" content="帮我解释一下这个主题系统的设计思路。" />
              <Bubble
                placement="start"
                avatar={<Avatar style={{ background: theme.color.primary }}>AI</Avatar>}
                content="这个主题系统采用 token 化设计，分为颜色、间距、圆角、阴影等维度..."
                styles={{ content: { background: theme.color.bgElevated } }}
              />
            </div>
          </div>

          {/* Think */}
          <div>
            <h3 css={labelStyle(theme)}>Think（思考过程）</h3>
            <div
              css={css`
                max-width: 500px;
              `}
            >
              <Think thinking="让我分析一下这个问题...\n首先需要理解主题系统的架构\n然后考虑 token 的分层设计..." />
            </div>
          </div>

          {/* ThoughtChain */}
          <div>
            <h3 css={labelStyle(theme)}>ThoughtChain（思考链）</h3>
            <div
              css={css`
                max-width: 500px;
              `}
            >
              <ThoughtChain items={thoughtChainItems} />
            </div>
          </div>

          {/* Sender */}
          <div>
            <h3 css={labelStyle(theme)}>Sender（发送框）</h3>
            <div
              css={css`
                max-width: 500px;
              `}
            >
              <Sender placeholder="输入消息..." />
            </div>
          </div>

          {/* 主题信息 */}
          <div
            css={css`
              padding: ${theme.spacing[3]} ${theme.spacing[4]};
              background: ${theme.color.fill};
              border-radius: ${theme.radius.md};
              font-family: ${theme.font.familyMono};
              font-size: ${theme.font.size.sm};
              color: ${theme.color.textSecondary};
            `}
          >
            XProvider tokens: bubbleBg="{xTokens.bubbleBg}" | userBubbleBg="{xTokens.userBubbleBg}"
          </div>
        </div>
      </XProvider>
    </ConfigProvider>
  );
}

const labelStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.semibold};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.color.textSecondary};
`;
