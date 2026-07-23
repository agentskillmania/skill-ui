/**
 * Workspace page — Cockpit view with Chat + Panels, Editor with ProjectEditor
 */
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';
import { Cockpit } from '@agentskillmania/skill-ui-cockpit';
import { ProjectEditor } from '@agentskillmania/skill-ui-editor';
import { css } from '@emotion/react';
import { useCallback, useEffect } from 'react';

import type { SessionInfo } from '../../server/types.js';
import { useChatAgent } from '../hooks/useChatAgent.js';
import { useCockpitEvents } from '../hooks/useCockpitEvents.js';
import { useEditor } from '../hooks/useEditor.js';
import type { ViewMode } from '../types.js';

interface WorkspacePageProps {
  session: SessionInfo;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onGoHome: () => void;
}

export function WorkspacePage({ session, viewMode }: WorkspacePageProps) {
  const chat = useChatAgent(session.id);
  const cockpit = useCockpitEvents(session.id);
  const editor = useEditor(session.id);

  const handleCommand = useCallback(
    (cmd: ChatCommand) => {
      chat.sendMessage(cmd.command);
    },
    [chat]
  );

  // Reload file tree when agent completes a tool call (may have modified files)
  useEffect(() => {
    if (viewMode === 'editor' && cockpit.events.length > 0) {
      const lastEvent = cockpit.events[cockpit.events.length - 1];
      if (lastEvent.type === 'tool' && lastEvent.subtype === 'end') {
        editor.loadTree();
      }
    }
  }, [cockpit.events, viewMode, editor]);

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
          messages={chat.messages}
          onSendMessage={chat.sendMessage}
          status={chat.status}
          commands={chat.commands}
          onCommand={handleCommand}
          events={cockpit.events}
          agentState={cockpit.agentState ?? undefined}
        />
      )}

      {viewMode === 'editor' && (
        <ProjectEditor
          files={editor.files}
          activeFilePath={editor.activeFilePath}
          editMode="code"
          activePanel="files"
          onFileChange={(_path, content) => editor.updateContent(content)}
          onActiveFileChange={(path) => path && editor.openFile(path)}
          onEditModeChange={() => {}}
          onPanelChange={() => {}}
          onSave={(path, content) => editor.saveFile(path, content)}
        />
      )}
    </div>
  );
}
