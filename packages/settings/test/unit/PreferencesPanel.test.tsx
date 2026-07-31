import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { PreferencesPanel } from '../../src/components/PreferencesPanel.js';
import type { AppPreferences } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const defaultValue: AppPreferences = {
  theme: 'system',
  language: 'zh-CN',
  defaultWorkspacePath: '/home/user/workspace',
  defaultAgentsPath: '/home/user/.agentskillmania/agents',
  defaultSkillsPath: '/home/user/.agentskillmania/skills',
};

describe('PreferencesPanel', () => {
  it('renders all form fields', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('prefs-theme')).toBeInTheDocument();
    expect(screen.getByTestId('prefs-language')).toBeInTheDocument();
    expect(screen.getByTestId('prefs-defaultWorkspacePath')).toBeInTheDocument();
    expect(screen.getByTestId('prefs-defaultAgentsPath')).toBeInTheDocument();
    expect(screen.getByTestId('prefs-defaultSkillsPath')).toBeInTheDocument();
  });

  it('displays current values', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const workspaceInput = screen.getByTestId('prefs-defaultWorkspacePath') as HTMLInputElement;
    expect(workspaceInput.value).toBe('/home/user/workspace');

    const agentsInput = screen.getByTestId('prefs-defaultAgentsPath') as HTMLInputElement;
    expect(agentsInput.value).toBe('/home/user/.agentskillmania/agents');

    const skillsInput = screen.getByTestId('prefs-defaultSkillsPath') as HTMLInputElement;
    expect(skillsInput.value).toBe('/home/user/.agentskillmania/skills');
  });

  it('calls onChange with theme when radio button clicked', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const lightRadio = screen.getByText('theme.light');
    await userEvent.click(lightRadio);

    expect(onChange).toHaveBeenCalledWith({ theme: 'light' });
  });

  it('calls onChange with language when select changes', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const select = screen.getByTestId('prefs-language');
    await userEvent.click(select);

    const enOption = screen.getByText('language.enUS');
    await userEvent.click(enOption);

    expect(onChange).toHaveBeenCalledWith({ language: 'en-US' });
  }, 10000);

  it('directory inputs are read-only', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const workspaceInput = screen.getByTestId('prefs-defaultWorkspacePath') as HTMLInputElement;
    const agentsInput = screen.getByTestId('prefs-defaultAgentsPath') as HTMLInputElement;
    const skillsInput = screen.getByTestId('prefs-defaultSkillsPath') as HTMLInputElement;

    expect(workspaceInput).toHaveAttribute('readonly');
    expect(agentsInput).toHaveAttribute('readonly');
    expect(skillsInput).toHaveAttribute('readonly');
  });

  it('does not call onChange when typing in directory inputs', async () => {
    const onChange = vi.fn();
    render(<PreferencesPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const workspaceInput = screen.getByTestId('prefs-defaultWorkspacePath');
    await userEvent.type(workspaceInput, '/new/path');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders i18n section titles', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByText('prefs.appearance.title')).toBeInTheDocument();
    expect(screen.getByText('prefs.workspace.title')).toBeInTheDocument();
  });

  it('renders theme radio buttons with correct labels', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByText('theme.light')).toBeInTheDocument();
    expect(screen.getByText('theme.dark')).toBeInTheDocument();
    expect(screen.getByText('theme.system')).toBeInTheDocument();
  });

  it('renders browse buttons for each directory', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const browseButtons = screen.getAllByTestId(/prefs-.*-browse/);
    expect(browseButtons.length).toBe(3);
  });

  it('disables browse buttons when onBrowseDirectory is not provided', () => {
    render(<PreferencesPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    const browseButtons = screen.getAllByTestId(/prefs-.*-browse/);
    for (const btn of browseButtons) {
      expect(btn).toBeDisabled();
    }
  });

  it('enables browse buttons when onBrowseDirectory is provided', () => {
    const onBrowse = vi.fn().mockResolvedValue(undefined);
    render(
      <PreferencesPanel value={defaultValue} onChange={() => {}} onBrowseDirectory={onBrowse} />,
      { wrapper }
    );

    const browseButtons = screen.getAllByTestId(/prefs-.*-browse/);
    for (const btn of browseButtons) {
      expect(btn).not.toBeDisabled();
    }
  });

  it('calls onBrowseDirectory and updates value via onChange on successful browse', async () => {
    const onChange = vi.fn();
    const onBrowse = vi.fn().mockResolvedValue('/home/user/selected-workspace');
    render(
      <PreferencesPanel value={defaultValue} onChange={onChange} onBrowseDirectory={onBrowse} />,
      { wrapper }
    );

    const workspaceBrowse = screen.getByTestId('prefs-defaultWorkspacePath-browse');
    await userEvent.click(workspaceBrowse);

    expect(onBrowse).toHaveBeenCalledWith('defaultWorkspacePath');
    // Wait for the async callback to resolve
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        defaultWorkspacePath: '/home/user/selected-workspace',
      });
    });
  });

  it('does not call onChange when onBrowseDirectory returns undefined (user cancelled)', async () => {
    const onChange = vi.fn();
    const onBrowse = vi.fn().mockResolvedValue(undefined);
    render(
      <PreferencesPanel value={defaultValue} onChange={onChange} onBrowseDirectory={onBrowse} />,
      { wrapper }
    );

    const workspaceBrowse = screen.getByTestId('prefs-defaultWorkspacePath-browse');
    await userEvent.click(workspaceBrowse);

    expect(onBrowse).toHaveBeenCalledWith('defaultWorkspacePath');
    // Give the async callback a chance to fire
    await vi.waitFor(() => {
      expect(onBrowse).toHaveBeenCalled();
    });
    // onChange should NOT have been called with the browse result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when onBrowseDirectory throws', async () => {
    const onChange = vi.fn();
    const onBrowse = vi.fn().mockRejectedValue(new Error('Dialog failed'));
    render(
      <PreferencesPanel value={defaultValue} onChange={onChange} onBrowseDirectory={onBrowse} />,
      { wrapper }
    );

    const workspaceBrowse = screen.getByTestId('prefs-defaultWorkspacePath-browse');
    await userEvent.click(workspaceBrowse);

    await vi.waitFor(() => {
      expect(onBrowse).toHaveBeenCalled();
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
