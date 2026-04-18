import { css } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { Button, Input, Card, Tag, Select, Switch, Space } from 'antd';
import type { Theme } from '../../src/index';
import { createAntdConfig } from '../../src/index';

export function AntdShowcase({ theme, mode }: { theme: Theme; mode: 'light' | 'dark' }) {
  const antdConfig = createAntdConfig(theme);

  return (
    <ConfigProvider theme={antdConfig}>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[6]};
        `}
      >
        {/* Button */}
        <div>
          <h3 css={labelStyle(theme)}>Button</h3>
          <Space>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button danger>Danger</Button>
            <Button type="primary" disabled>
              Disabled
            </Button>
          </Space>
        </div>

        {/* Input */}
        <div>
          <h3 css={labelStyle(theme)}>Input</h3>
          <Space
            orientation="vertical"
            css={css`
              width: 300px;
            `}
          >
            <Input placeholder="请输入..." />
            <Input.Password placeholder="密码..." />
          </Space>
        </div>

        {/* Card */}
        <div>
          <h3 css={labelStyle(theme)}>Card</h3>
          <Card
            title="示例卡片"
            css={css`
              width: 300px;
            `}
          >
            <p>这是一个 Ant Design 卡片组件，展示当前主题下的效果。</p>
          </Card>
        </div>

        {/* Tag */}
        <div>
          <h3 css={labelStyle(theme)}>Tag</h3>
          <Space>
            <Tag>Default</Tag>
            <Tag color="blue">Blue</Tag>
            <Tag color="green">Green</Tag>
            <Tag color="red">Red</Tag>
            <Tag color="orange">Orange</Tag>
            <Tag color="purple">Purple</Tag>
          </Space>
        </div>

        {/* Select & Switch */}
        <div>
          <h3 css={labelStyle(theme)}>Select & Switch</h3>
          <Space>
            <Select
              defaultValue="option1"
              css={css`
                width: 160px;
              `}
              options={[
                { value: 'option1', label: '选项一' },
                { value: 'option2', label: '选项二' },
                { value: 'option3', label: '选项三' },
              ]}
            />
            <Switch defaultChecked />
          </Space>
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
          mode: "{mode}" | colorPrimary: "{theme.color.primary}" | bgBase: "{theme.color.bgBase}"
        </div>
      </div>
    </ConfigProvider>
  );
}

const labelStyle = (theme: Theme) => css`
  font-size: ${theme.font.size.base};
  font-weight: ${theme.font.weight.semibold};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.color.textSecondary};
`;
