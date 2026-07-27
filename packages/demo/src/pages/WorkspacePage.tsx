/**
 * Workspace page — Cockpit view (chat + event-log) or Editor view
 *
 * Uses useChatSession (backed by skill-ui-state) for all real-time data.
 * Cockpit and ProjectEditor receive props via the state package's selectors.
 */
import { Cockpit } from '@agentskillmania/skill-ui-cockpit';
import { ProjectEditor } from '@agentskillmania/skill-ui-editor';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';
import type { ProjectFile, FileTab, EditMode, EditorPanel } from '@agentskillmania/skill-ui-editor';
import { css } from '@emotion/react';
import { useState, useCallback, useEffect } from 'react';

import type { SessionInfo } from '../../server/types.js';
import { useChatSession } from '../hooks/useChatSession.js';
import { useEditor } from '../hooks/useEditor.js';
import type { ViewMode } from '../types.js';

interface WorkspacePageProps {
  session: SessionInfo;
  viewMode: ViewMode;
}

export function WorkspacePage({ session, viewMode }: WorkspacePageProps) {
  const chat = useChatSession(session.id);
  const editor = useEditor(session.id);

  // Editor controlled state
  const [openTabs, setOpenTabs] = useState<FileTab[]>([]);
  const [editMode, setEditMode] = useState<EditMode>('code');
  const [activePanel, setActivePanel] = useState<EditorPanel>('files');

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
        // Add to tabs if not already there
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
      // CockpitEventType uses colon names, but our events use hyphenated SSE names
      // Check the raw type string for tool-end events
      const eventType = (lastEvent as { type: string }).type;
      if (eventType === 'tool-end') {
        editor.loadTree();
      }
    }
  }, [chat.cockpitEvents, viewMode, editor]);

  // Convert editor files to ProjectFile format
  const projectFiles: ProjectFile[] = editor.files as ProjectFile[];

  return (
    <div
      css={css`
        flex: 1;
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
          eventLogEvents={chat.cockpitEvents}
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
          // Copilot panel shares the same chat session as Cockpit
          copilotMessages={chat.messages}
          copilotStatus={chat.status}
          copilotCommands={chat.commands}
          copilotInputValue={chat.inputValue}
          onCopilotInputChange={chat.onInputChange}
          onCopilotSend={chat.sendMessage}
          onCopilotStop={chat.stop}
        />
      )}
    </div>
  );
}
