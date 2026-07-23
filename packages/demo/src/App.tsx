/**
 * chat-demo main UI — AppFrame with Launcher / Workspace routing
 */
import { AppFrame } from '@agentskillmania/skill-ui-frame';
import {
  ThemeProvider,
  lightAntdConfig,
  darkAntdConfig,
  GlobalStyles,
} from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { ConfigProvider, Spin, Divider } from 'antd';
import { useState, useCallback, useEffect } from 'react';

import { TitlebarEnd } from './components/TitlebarEnd.js';
import { ViewSwitch } from './components/ViewSwitch.js';
import { WorkspaceNav } from './components/WorkspaceNav.js';
import { useSession } from './hooks/useSession.js';
import { LauncherPage } from './pages/LauncherPage.js';
import { WorkspacePage } from './pages/WorkspacePage.js';
import type { Route, ViewMode } from './types.js';

function parseHash(): Route {
  const hash = window.location.hash;
  if (hash.startsWith('#/workspace/')) {
    const sessionId = hash.replace('#/workspace/', '');
    if (sessionId) return { page: 'workspace', sessionId };
  }
  return { page: 'launcher' };
}

export function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cockpit');
  const sessionManager = useSession();

  // Sync hash with route
  useEffect(() => {
    if (route.page === 'workspace') {
      window.location.hash = `#/workspace/${route.sessionId}`;
    } else {
      window.location.hash = '#/';
    }
  }, [route]);

  // Handle hash navigation (browser back/forward)
  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Auto-load session when navigating to workspace
  useEffect(() => {
    if (route.page === 'workspace' && sessionManager.activeSession?.id !== route.sessionId) {
      sessionManager.loadSession(route.sessionId);
    }
  }, [route, sessionManager]);

  const navigate = useCallback(
    (newRoute: Route) => {
      setRoute(newRoute);
      if (newRoute.page === 'launcher') {
        sessionManager.clearSession();
      }
    },
    [sessionManager]
  );

  const goHome = useCallback(() => {
    navigate({ page: 'launcher' });
  }, [navigate]);

  const createAndNavigate = useCallback(
    async (options: { workspacePath: string; agentPath?: string }): Promise<string | null> => {
      const info = await sessionManager.createSession(options);
      return info?.id ?? null;
    },
    [sessionManager]
  );

  const isLauncher = route.page === 'launcher';

  // Titlebar center slot
  const titlebarCenter = isLauncher ? null : (
    <WorkspaceNav
      workspaceName={sessionManager.activeSession?.workspacePath?.split('/').pop() ?? 'workspace'}
      onGoHome={goHome}
    />
  );

  // Titlebar end slot
  const titlebarEnd = (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: 6px;
      `}
    >
      {!isLauncher && (
        <>
          <ViewSwitch value={viewMode} onChange={setViewMode} />
          <Divider type="vertical" />
        </>
      )}
      <TitlebarEnd isDark={isDark} onToggleTheme={setIsDark} />
    </div>
  );

  return (
    <ConfigProvider theme={isDark ? darkAntdConfig : lightAntdConfig}>
      <ThemeProvider mode={isDark ? 'dark' : 'light'}>
        <GlobalStyles />
        <AppFrame titlebarCenter={titlebarCenter} titlebarEnd={titlebarEnd}>
          {isLauncher ? (
            <LauncherPage onNavigate={navigate} onCreateSession={createAndNavigate} />
          ) : sessionManager.activeSession ? (
            <WorkspacePage
              session={sessionManager.activeSession}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onGoHome={goHome}
            />
          ) : (
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
              `}
            >
              <Spin tip="Loading session..." />
            </div>
          )}
        </AppFrame>
      </ThemeProvider>
    </ConfigProvider>
  );
}
