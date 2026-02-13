'use client';

import styled from 'styled-components';
import { MIN_PASSWORD_LENGTH } from '../lib/constants/ui';
import { PrimaryButton, SecondaryButton, TextInput } from './ui';

type SettingsPanelProps = {
  settingsEmail: string;
  settingsUsername: string;
  newPassword: string;
  confirmPassword: string;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSaveSettings: () => void;
  onSignOut: () => void;
  isSettingsSaving: boolean;
  isAuthWorking: boolean;
};

export default function SettingsPanel({
  settingsEmail,
  settingsUsername,
  newPassword,
  confirmPassword,
  onEmailChange,
  onUsernameChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSaveSettings,
  onSignOut,
  isSettingsSaving,
  isAuthWorking
}: SettingsPanelProps) {
  return (
    <ContentScrollArea>
      <SettingsForm>
        <FieldGroup>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <TextInput
            id="settings-email"
            type="email"
            value={settingsEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            disabled={isSettingsSaving}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="settings-username">Username</FieldLabel>
          <TextInput
            id="settings-username"
            type="text"
            value={settingsUsername}
            onChange={(event) => onUsernameChange(event.target.value)}
            disabled={isSettingsSaving}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="settings-password">New password</FieldLabel>
          <TextInput
            id="settings-password"
            type="password"
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
            disabled={isSettingsSaving}
            autoComplete="new-password"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="settings-password-confirm">Confirm new password</FieldLabel>
          <TextInput
            id="settings-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            disabled={isSettingsSaving}
            autoComplete="new-password"
          />
        </FieldGroup>
        <SettingsHint>
          Changing email sends a confirmation link. Passwords must be at least {MIN_PASSWORD_LENGTH} characters.
        </SettingsHint>
        <SettingsActions>
          <PrimaryButton onClick={onSaveSettings} disabled={isSettingsSaving}>
            Save settings
          </PrimaryButton>
          <SecondaryButton onClick={onSignOut} disabled={isAuthWorking}>
            Sign out
          </SecondaryButton>
        </SettingsActions>
      </SettingsForm>
    </ContentScrollArea>
  );
}

const ContentScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  margin-right: -6px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 720px) {
    padding-right: 0;
    margin-right: 0;
  }
`;

const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 520px;

  @media (max-width: 720px) {
    max-width: none;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  color: var(--muted);
`;

const SettingsHint = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--muted);
`;

const SettingsActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
