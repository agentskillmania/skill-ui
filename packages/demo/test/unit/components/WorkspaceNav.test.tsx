import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceNav } from '../../../src/components/WorkspaceNav.js';
import { ThemeWrapper } from '../testUtils.js';

describe('WorkspaceNav', () => {
  it('renders the workspace name', () => {
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="my-project" onGoHome={vi.fn()} />
      </ThemeWrapper>
    );
    expect(screen.getByText(/my-project/)).toBeInTheDocument();
  });

  it('renders the home button', () => {
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="test" onGoHome={vi.fn()} />
      </ThemeWrapper>
    );
    const homeBtn = screen.getByRole('button');
    expect(homeBtn).toBeInTheDocument();
  });

  it('calls onGoHome when home button is clicked', async () => {
    const onGoHome = vi.fn();
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="test" onGoHome={onGoHome} />
      </ThemeWrapper>
    );

    const homeBtn = screen.getByRole('button');
    await userEvent.click(homeBtn);
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('renders the separator between home and workspace name', () => {
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="test" onGoHome={vi.fn()} />
      </ThemeWrapper>
    );
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders workspace switcher trigger', () => {
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="test" onGoHome={vi.fn()} />
      </ThemeWrapper>
    );
    const trigger = screen.getByText(/test/);
    expect(trigger.textContent).toContain('test');
    expect(trigger.textContent).toContain('▾');
  });

  it('renders workspace options in dropdown when provided', async () => {
    const workspaces = [
      { id: 'ws1', name: 'project-alpha' },
      { id: 'ws2', name: 'project-beta' },
    ];
    render(
      <ThemeWrapper>
        <WorkspaceNav
          workspaceName="project-alpha"
          onGoHome={vi.fn()}
          workspaces={workspaces}
          onSwitchWorkspace={vi.fn()}
        />
      </ThemeWrapper>
    );

    // Click the dropdown trigger to open it
    const trigger = screen.getByText(/project-alpha/);
    await userEvent.click(trigger);

    // Dropdown items should appear — both alpha and beta
    const items = screen.getAllByText(/project-/);
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onSwitchWorkspace when a workspace option is clicked', async () => {
    const onSwitch = vi.fn();
    const workspaces = [
      { id: 'ws1', name: 'project-alpha' },
      { id: 'ws2', name: 'project-beta' },
    ];
    render(
      <ThemeWrapper>
        <WorkspaceNav
          workspaceName="project-alpha"
          onGoHome={vi.fn()}
          workspaces={workspaces}
          onSwitchWorkspace={onSwitch}
        />
      </ThemeWrapper>
    );

    // Open dropdown
    const trigger = screen.getByText(/project-alpha/);
    await userEvent.click(trigger);

    // Click the beta option
    await userEvent.click(screen.getByText('project-beta'));
    expect(onSwitch).toHaveBeenCalledWith('ws2');
  });

  it('renders without workspaces prop (empty dropdown)', () => {
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="test" onGoHome={vi.fn()} />
      </ThemeWrapper>
    );
    // Should still render the trigger but no workspace items
    expect(screen.getByText(/test/)).toBeInTheDocument();
  });

  it('does not call onSwitchWorkspace when __open menu item is clicked', async () => {
    const onSwitch = vi.fn();
    render(
      <ThemeWrapper>
        <WorkspaceNav
          workspaceName="test"
          onGoHome={vi.fn()}
          workspaces={[]}
          onSwitchWorkspace={onSwitch}
        />
      </ThemeWrapper>
    );

    // Open dropdown
    const trigger = screen.getByText(/test/);
    await userEvent.click(trigger);

    // Click the "Open Directory" item — this should NOT trigger onSwitchWorkspace
    const openDirItem = screen.getByText(/Open Directory/);
    await userEvent.click(openDirItem);

    expect(onSwitch).not.toHaveBeenCalled();
  });

  it('does not call onSwitchWorkspace when not provided', async () => {
    const workspaces = [{ id: 'ws1', name: 'project-alpha' }];
    render(
      <ThemeWrapper>
        <WorkspaceNav workspaceName="project-alpha" onGoHome={vi.fn()} workspaces={workspaces} />
      </ThemeWrapper>
    );

    // Open dropdown and click workspace — onSwitchWorkspace is undefined
    const trigger = screen.getByText(/project-alpha/);
    await userEvent.click(trigger);

    // Should not crash when onSwitchWorkspace is not provided
    const items = screen.getAllByText(/project-/);
    if (items.length > 1) {
      await userEvent.click(screen.getByText('project-alpha'));
    }
  });
});
