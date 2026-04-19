/**
 * chat-demo 主界面
 */
import { css } from '@emotion/react';
import { useState, useCallback } from 'react';
import { ConfigProvider, Switch } from 'antd';
import { Chat } from '@agentskillmania/skill-ui-chat';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';
import {
  ThemeProvider,
  lightAntdConfig,
  darkAntdConfig,
  GlobalStyles,
  useTheme,
} from '@agentskillmania/skill-ui-theme';
import { useChatAgent } from './hooks/useChatAgent.js';

export function App() {
  const [isDark, setIsDark] = useState(false);
  const chat = useChatAgent();

  return (
    <ConfigProvider theme={isDark ? darkAntdConfig : lightAntdConfig}>
      <ThemeProvider mode={isDark ? 'dark' : 'light'}>
        <GlobalStyles />
        <ChatUI isDark={isDark} onToggleTheme={setIsDark} {...chat} />
      </ThemeProvider>
    </ConfigProvider>
  );
}

function ChatUI({
  isDark,
  onToggleTheme,
  messages,
  status,
  inputValue,
  onInputChange,
  sendMessage,
  stop,
  commands,
  respondHumanInput,
}: {
  isDark: boolean;
  onToggleTheme: (v: boolean) => void;
  messages: ReturnType<typeof useChatAgent>['messages'];
  status: ReturnType<typeof useChatAgent>['status'];
  inputValue: ReturnType<typeof useChatAgent>['inputValue'];
  onInputChange: ReturnType<typeof useChatAgent>['onInputChange'];
  sendMessage: ReturnType<typeof useChatAgent>['sendMessage'];
  stop: ReturnType<typeof useChatAgent>['stop'];
  commands: ReturnType<typeof useChatAgent>['commands'];
  respondHumanInput: ReturnType<typeof useChatAgent>['respondHumanInput'];
}) {
  const theme = useTheme();

  /** 指令选择回调：将 command 文本作为消息发送 */
  const handleCommand = useCallback(
    (cmd: ChatCommand) => {
      sendMessage(cmd.command);
    },
    [sendMessage]
  );

  /** 消息装饰器：在消息上方显示时间戳 */
  const messageDecorator = useCallback(
    (message: { createdAt?: number }, element: React.ReactNode) => (
      <div>
        <div
          css={css`
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textTertiary};
            margin-bottom: ${theme.spacing[1]};
            padding-left: ${theme.spacing[1]};
          `}
        >
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>
        {element}
      </div>
    ),
    [theme]
  );

  return (
    <div
      css={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: ${theme.color.bgBase};
      `}
    >
      {/* 顶栏 */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          border-bottom: 1px solid ${theme.color.border};
        `}
      >
        <span
          css={css`
            font-size: ${theme.font.size.lg};
            font-weight: 600;
            color: ${theme.color.text};
          `}
        >
          Chat Demo — colts × skill-ui
        </span>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              color: ${theme.color.textSecondary};
            `}
          >
            深色
          </span>
          <Switch checked={isDark} onChange={onToggleTheme} size="small" />
        </div>
      </div>

      {/* 聊天区域 */}
      <div
        css={css`
          flex: 1;
          overflow: hidden;
        `}
      >
        <Chat
          messages={messages}
          status={status}
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSendMessage={sendMessage}
          onStop={stop}
          onConfirmHumanRequest={respondHumanInput}
          commands={commands}
          onCommand={handleCommand}
          messageDecorator={messageDecorator}
          placeholder="输入消息与 AI 助手对话...（输入 / 触发指令）"
        />
      </div>
    </div>
  );
}
