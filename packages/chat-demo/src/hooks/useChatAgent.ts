/**
 * useChatAgent — SSE 连接 hook，将服务端事件映射为 skill-ui-chat Message[]
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Message, Block, ChatCommand } from '@agentskillmania/skill-ui-chat';

let idCounter = 0;
function genId(): string {
  return `msg-${Date.now()}-${++idCounter}`;
}

let blockIdCounter = 0;
function genBlockId(): string {
  return `blk-${Date.now()}-${++blockIdCounter}`;
}

type ChatStatus = 'idle' | 'streaming' | 'error';

interface SSEData {
  delta?: string;
  content?: string;
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
  callId?: string;
  result?: string;
  message?: string;
  aborted?: boolean;
  // skill 事件
  tokenCount?: number;
  task?: string;
  // human-input 事件
  requestId?: string;
  questions?: Array<{ id: string; question: string; type: string; options?: string[] }>;
  context?: string;
}

export function useChatAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [commands, setCommands] = useState<ChatCommand[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string>('');

  // 启动时拉取指令列表
  useEffect(() => {
    fetch('/api/chat/commands')
      .then((res) => res.json())
      .then((data) => setCommands(data))
      .catch(() => {
        // 忽略
      });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content,
      status: 'completed',
      createdAt: Date.now(),
    };

    const assistantId = genId();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now(),
    };

    assistantIdRef.current = assistantId;
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStatus('streaming');
    setInputValue('');

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // 当前 thinking block ID（用于增量更新）
      let thinkingBlockId: string | null = null;
      // 当前 skill block ID（用于增量更新）
      let skillBlockId: string | null = null;
      // 当前 tool_call blocks 映射 name → blockId
      const toolBlockIds = new Map<string, string>();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 格式
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6);
            }
          }

          if (!eventType) continue;

          let data: SSEData = {};
          try {
            data = JSON.parse(dataStr);
          } catch {
            continue;
          }

          const aid = assistantIdRef.current;

          switch (eventType) {
            case 'token': {
              thinkingBlockId = null;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aid ? { ...m, content: m.content + (data.delta ?? '') } : m
                )
              );
              break;
            }

            case 'thinking': {
              const content = data.content ?? '';
              if (thinkingBlockId) {
                // 增量更新
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aid
                      ? {
                          ...m,
                          blocks: (m.blocks ?? []).map((b) =>
                            b.id === thinkingBlockId ? { ...b, content: b.content + content } : b
                          ),
                        }
                      : m
                  )
                );
              } else {
                // 新建 thinking block
                const blockId = genBlockId();
                thinkingBlockId = blockId;
                const block: Block = {
                  id: blockId,
                  type: 'thinking',
                  status: 'streaming',
                  content,
                };
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aid ? { ...m, blocks: [...(m.blocks ?? []), block] } : m
                  )
                );
              }
              break;
            }

            case 'tool-start': {
              thinkingBlockId = null;
              const toolName = data.name ?? 'unknown';
              const blockId = genBlockId();
              toolBlockIds.set(toolName, blockId);
              const block: Block = {
                id: blockId,
                type: 'tool_call',
                status: 'streaming',
                content: '',
                metadata: {
                  toolName,
                  toolArgs: JSON.stringify(data.args ?? {}),
                },
              };
              setMessages((prev) =>
                prev.map((m) => (m.id === aid ? { ...m, blocks: [...(m.blocks ?? []), block] } : m))
              );
              break;
            }

            case 'tool-end': {
              thinkingBlockId = null;
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aid) return m;
                  const blocks = (m.blocks ?? []).map((b) => {
                    if (b.type === 'tool_call' && b.status === 'streaming') {
                      return {
                        ...b,
                        status: 'completed' as const,
                        metadata: {
                          ...b.metadata,
                          toolResult: data.result ?? '',
                        },
                      };
                    }
                    return b;
                  });
                  return { ...m, blocks };
                })
              );
              break;
            }

            case 'skill-loading': {
              thinkingBlockId = null;
              const blockId = genBlockId();
              skillBlockId = blockId;
              const block: Block = {
                id: blockId,
                type: 'skill',
                status: 'streaming',
                content: '',
                metadata: {
                  skillName: data.name,
                  phase: 'loading',
                },
              };
              setMessages((prev) =>
                prev.map((m) => (m.id === aid ? { ...m, blocks: [...(m.blocks ?? []), block] } : m))
              );
              break;
            }

            case 'skill-loaded': {
              const targetId = skillBlockId;
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aid) return m;
                  return {
                    ...m,
                    blocks: (m.blocks ?? []).map((b) =>
                      b.id === targetId
                        ? {
                            ...b,
                            metadata: {
                              ...b.metadata,
                              skillName: data.name,
                              phase: 'loaded',
                              tokenCount: data.tokenCount,
                            },
                          }
                        : b
                    ),
                  };
                })
              );
              break;
            }

            case 'skill-start': {
              const targetId = skillBlockId;
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aid) return m;
                  return {
                    ...m,
                    blocks: (m.blocks ?? []).map((b) =>
                      b.id === targetId
                        ? {
                            ...b,
                            metadata: {
                              ...b.metadata,
                              phase: 'executing',
                              task: data.task,
                            },
                          }
                        : b
                    ),
                  };
                })
              );
              break;
            }

            case 'skill-end': {
              const targetId = skillBlockId;
              skillBlockId = null;
              const resultStr =
                typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aid) return m;
                  return {
                    ...m,
                    blocks: (m.blocks ?? []).map((b) =>
                      b.id === targetId
                        ? {
                            ...b,
                            status: 'completed' as const,
                            content: resultStr ? `结果: ${resultStr.slice(0, 200)}` : '',
                            metadata: {
                              ...b.metadata,
                              phase: 'completed',
                              result: resultStr,
                            },
                          }
                        : b
                    ),
                  };
                })
              );
              break;
            }

            case 'human-input': {
              thinkingBlockId = null;
              const reqId = data.requestId ?? '';
              const questions = data.questions ?? [];

              // 构建 human_input block
              const firstQuestion = questions[0];
              let inputType: 'confirmation' | 'input' | 'single-select' | 'multi-select' = 'input';
              let options: Array<{ label: string; value: string }> | undefined;

              if (firstQuestion) {
                switch (firstQuestion.type) {
                  case 'single-select':
                    inputType = 'single-select';
                    options = firstQuestion.options?.map((o) => ({ label: o, value: o }));
                    break;
                  case 'multi-select':
                    inputType = 'multi-select';
                    options = firstQuestion.options?.map((o) => ({ label: o, value: o }));
                    break;
                  default:
                    inputType = 'input';
                    break;
                }
              }

              const block: Block = {
                id: genBlockId(),
                type: 'human_input',
                status: 'pending',
                content: '',
                metadata: {
                  requestId: reqId,
                  inputType,
                  title: data.context ?? 'AI 需要你的输入',
                  message: questions.map((q) => q.question).join('\n'),
                  options,
                },
              };
              setMessages((prev) =>
                prev.map((m) => (m.id === aid ? { ...m, blocks: [...(m.blocks ?? []), block] } : m))
              );
              break;
            }

            case 'done': {
              thinkingBlockId = null;
              skillBlockId = null;
              // 标记所有 streaming blocks 为 completed
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aid) return m;
                  return {
                    ...m,
                    status: 'completed',
                    blocks: (m.blocks ?? []).map((b) =>
                      b.status === 'streaming' ? { ...b, status: 'completed' as const } : b
                    ),
                  };
                })
              );
              setStatus('idle');
              break;
            }

            case 'error': {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aid
                    ? {
                        ...m,
                        status: 'error',
                        content: m.content || `错误: ${data.message ?? '未知错误'}`,
                      }
                    : m
                )
              );
              setStatus('error');
              break;
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // 用户主动停止
        const aid = assistantIdRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aid && m.status === 'streaming' ? { ...m, status: 'completed' } : m
          )
        );
        setStatus('idle');
      } else {
        const aid = assistantIdRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aid && m.status === 'streaming'
              ? {
                  ...m,
                  status: 'error',
                  content: m.content || `连接失败: ${String(err)}`,
                }
              : m
          )
        );
        setStatus('error');
      }
    }
  }, []);

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    try {
      await fetch('/api/chat/stop', { method: 'POST' });
    } catch {
      // 忽略
    }
  }, []);

  /** 用户回复 AskHuman 请求 */
  const respondHumanInput = useCallback(async (requestId: string, response: unknown) => {
    try {
      await fetch('/api/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, response }),
      });
    } catch {
      // 忽略
    }
  }, []);

  return {
    messages,
    status,
    inputValue,
    onInputChange: setInputValue,
    sendMessage,
    stop,
    commands,
    respondHumanInput,
  };
}
