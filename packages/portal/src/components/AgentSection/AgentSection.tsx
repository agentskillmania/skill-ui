/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import { List, Pagination, Button, Empty, Modal, Form, Input } from 'antd';
import { Plus } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { AgentCard } from '../AgentCard/AgentCard.js';
import type { AgentItem } from '../../types.js';

const DEFAULT_PAGE_SIZE = 12;

interface AgentSectionProps {
  agents: AgentItem[];
  page: number;
  pageSize?: number;
  total: number;
  onPageChange: (page: number) => void;
  onChat: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (name: string) => void;
}

export function AgentSection({
  agents,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
  onChat,
  onEdit,
  onDelete,
  onCreate,
}: AgentSectionProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onCreate(values.name.trim());
    setIsModalOpen(false);
  };

  return (
    <div>
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[4],
        }}
      >
        <span css={{ fontSize: theme.font.size.xl, fontWeight: 600 }}>{t('agents')}</span>
        <Button type="dashed" icon={<Plus size={14} />} onClick={handleOpen}>
          {t('newAgent')}
        </Button>
      </div>

      {agents.length > 0 ? (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={agents}
            renderItem={(item) => (
              <List.Item>
                <AgentCard
                  agent={item}
                  onChat={() => onChat(item.id)}
                  onEdit={() => onEdit(item.id)}
                  onDelete={() => onDelete(item.id)}
                />
              </List.Item>
            )}
          />
          {total > pageSize && (
            <div css={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
              />
            </div>
          )}
        </>
      ) : (
        <Empty description={t('noAgents')} />
      )}

      <Modal
        title={t('newAgent')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={t('create')}
        cancelText={t('cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('name')}
            rules={[{ required: true, message: t('nameRequired') ?? '请输入名称' }]}
          >
            <Input placeholder={t('namePlaceholder') ?? '请输入代理名称'} autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
