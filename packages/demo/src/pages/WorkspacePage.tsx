/**
 * Workspace page — Cockpit view (chat + event-log) or Editor view
 *
 * Uses useChatSession (backed by skill-ui-state) for all real-time data.
 * The session may be "pending" (placeholder ID) on first visit — the real
 * daemon session ID is established when the user sends their first message.
 */
import { Cockpit } from '@agentskillmania/skill-ui-cockpit';
import { ProjectEditor } from '@agentskillmania/skill-ui-editor';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';
import type { ProjectFile, FileTab, EditMode, EditorPanel } from '@agentskillmania/skill-ui-editor';
import { css } from '@emotion/react';
import { useState, useCallback, useEffect } from 'react';

import type { SessionInfo, Route } from '../types.js';
import { useChatSession } from '../hooks/useChatSession.js';
import { useEditor } from '../hooks/useEditor.js';
import type { ViewMode } from '../types.js';

interface WorkspacePageProps {
  session: SessionInfo;
  viewMode: ViewMode;
  onNavigate?: (route: Route) => void;
}

export function WorkspacePage({ session, viewMode, onNavigate }: WorkspacePageProps) {
  // Main chat session — may start with a placeholder ID (pending-*),
  // resolved to a real daemon session on first message.
  const isPending = session.id.startsWith('pending-');
  const chat = useChatSession(session.id, {
    agentName: session.agentName || 'coder',
    workspacePath: session.workspacePath,
  });

  // File editor uses the resolved session ID (files API needs real session).
  // Before the session is established, editor starts empty.
  const editor = useEditor(chat.resolvedSessionId ?? '__pending__');

  // Copilot has its own independent chat session — also uses the
  // two-phase model (placeholder until first message).
  const copilot = useChatSession('__pending__', {
    agentName: session.agentName || 'coder',
    workspacePath: session.workspacePath,
  });

  // Editor controlled state
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const [editMode, setEditMode] = useState<EditMode>('code');
  const [activePanel, setActivePanel] = useState<EditorPanel>('files');

  // Sessions list for cockpit sidebar
  const [sessionsList, setSessionsList] = useState<SessionInfo[]>([]);
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SessionInfo[]) => setSessionsList(data))
      .catch(() => {});
  }, [chat.status]); // refresh when chat status changes

  // Session board data for cockpit metrics panel
  const sessionBoardState = {
    session: {
      overview: {
        agentName: session.agentName || 'coder',
        model: session.model || 'glm-5.1',
        stepCount: chat.stepCount,
        messageCount: chat.messages.length,
        tokensIn: chat.totalTokens?.input,
        tokensOut: chat.totalTokens?.output,
        status: (chat.status === 'streaming' ? 'running' : chat.status === 'error' ? 'error' : 'idle') as 'running' | 'error' | 'idle',
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      info: {
        sessionId: chat.resolvedSessionId ?? session.id,
        agentName: session.agentName || 'coder',
        model: session.model || 'glm-5.1',
        workspacePath: session.workspacePath,
        skillDirs: [] as string[],
        mcpConfigPaths: [] as string[],
      },
    },
    agent: {},
    llm: null,
    runner: {},
  } as const;

  const handleCommand = useCallback(
    (cmd: ChatCommand) => {
      chat.sendMessage(cmd.command);
    },
    [chat]
  );

  const handleActiveFileChange = useCallback(
    (path: string | null) => {
      if (path) {
        editor.openFile(path);
        const existing = openTabs.find((t) => t.path === path);
        if (!existing) {
          const fileName = path.split('/').pop() ?? path;
          setOpenTabs((prev) => [...prev, { path, label: fileName }]);
        }
      }
    },
    [editor, openTabs]
  );

  const handleSave = useCallback(
    (path: string, content: string) => {
      editor.saveFile(path, content);
    },
    [editor]
  );

  // Reload file tree when agent completes a tool call
  useEffect(() => {
    if (viewMode === 'editor' && chat.cockpitEvents.length > 0) {
      const lastEvent = chat.cockpitEvents[chat.cockpitEvents.length - 1];
      const eventType = (lastEvent as { type: string }).type;
      if (eventType === 'tool-end') {
        editor.loadTree();
      }
    }
  }, [chat.cockpitEvents, viewMode, editor]);

  const projectFiles: ProjectFile[] = editor.files as ProjectFile[];

  return (
    <div
      css={css`
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      {viewMode === 'cockpit' && (
        <Cockpit
          chatMessages={chat.messages}
          onChatSendMessage={chat.sendMessage}
          onChatStop={chat.stop}
          onChatConfirmHumanRequest={chat.respondHumanInput}
          chatInputValue={chat.inputValue}
          onChatInputChange={chat.onInputChange}
          chatStatus={chat.status}
          chatCommands={chat.commands}
          onChatCommand={handleCommand}
          onChatNewSession={onNavigate ? () => onNavigate({ page: 'launcher' }) : undefined}
          eventLogEvents={chat.cockpitEvents}
          sessionsSessions={sessionsList}
          sessionsActiveId={chat.resolvedSessionId ?? undefined}
          onSessionsSelect={(id) => onNavigate?.({ page: 'workspace', sessionId: id })}
          sessionBoardState={sessionBoardState}
        />
      )}

      {viewMode === 'editor' && (
        <ProjectEditor
          editorFiles={projectFiles}
          editorActiveFilePath={editor.activeFilePath}
          editorActiveFileContent={editor.activeFileContent}
          editorOpenTabs={openTabs}
          onEditorOpenTabsChange={setOpenTabs}
          editorEditMode={editMode}
          onEditorEditModeChange={setEditMode}
          editorActivePanel={activePanel}
          onEditorPanelChange={setActivePanel}
          onEditorFileChange={(_path, content) => editor.updateContent(content)}
          onEditorActiveFileChange={handleActiveFileChange}
          onEditorSave={handleSave}
          // Copilot panel has its own independent chat session
          copilotMessages={copilot.messages}
          copilotStatus={copilot.status}
          copilotCommands={copilot.commands}
          copilotInputValue={copilot.inputValue}
          onCopilotInputChange={copilot.onInputChange}
          onCopilotSend={copilot.sendMessage}
          onCopilotStop={copilot.stop}
        />
      )}
    </div>
  );
}
