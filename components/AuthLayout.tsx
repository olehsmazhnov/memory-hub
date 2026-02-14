'use client';

import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { BRAND_SUBTITLE, BRAND_TITLE, AUTH_RIGHT_SUBTITLE, AUTH_RIGHT_TITLE } from '../lib/constants/branding';
import { EyeIcon, EyeOffIcon } from './Icons';
import { BrandGroup, BrandSubtitle, BrandTitle, MutedText, PrimaryButton, SecondaryButton, TextInput } from './ui';

type AuthLayoutProps = {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  // onSignInWithGoogle: () => void;
  isAuthWorking: boolean;
};

export default function AuthLayout({
  onSignIn,
  onSignUp,
  // onSignInWithGoogle,
  isAuthWorking
}: AuthLayoutProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleSignInSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn(email, password);
  };

  return (
    <AuthGrid>
      <AuthSidebar>
        <BrandGroup>
          <BrandTitle>{BRAND_TITLE}</BrandTitle>
          <BrandSubtitle>{BRAND_SUBTITLE}</BrandSubtitle>
        </BrandGroup>
        <AuthCard>
          <CardTitle>Welcome back</CardTitle>
          <MutedText>Sign in or create an account to start.</MutedText>
          <AuthForm onSubmit={handleSignInSubmit}>
            <FormStack>
              <AuthTextInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <PasswordInputWrap>
                <PasswordInput
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <PasswordToggleButton
                  type="button"
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((isCurrentPasswordVisible) => !isCurrentPasswordVisible)}
                >
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </PasswordToggleButton>
              </PasswordInputWrap>
            </FormStack>
            <ButtonRow>
              <PrimaryButton type="submit" disabled={isAuthWorking}>
                Sign in
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => onSignUp(email, password)} disabled={isAuthWorking}>
                Sign up
              </SecondaryButton>
            </ButtonRow>
            {/* <OAuthButton
              type="button"
              onClick={onSignInWithGoogle}
              disabled={isAuthWorking}
            >
              Continue with Google
            </OAuthButton> */}
          </AuthForm>
        </AuthCard>
      </AuthSidebar>
      <AuthRight>
        <AuthRightInner>
          <AuthTitle>{AUTH_RIGHT_TITLE}</AuthTitle>
          <AuthSubtitle>{AUTH_RIGHT_SUBTITLE}</AuthSubtitle>
        </AuthRightInner>
      </AuthRight>
    </AuthGrid>
  );
}

const AuthGrid = styled.section`
  display: grid;
  grid-template-columns: 440px 1fr;
  grid-template-rows: minmax(0, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(220px, 1fr);
    padding: 12px;
    gap: 16px;
  }

  @media (max-width: 720px) {
    padding: 6px;
    gap: 22px;
  }
`;

const AuthSidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  min-height: 0;
  align-items: stretch;

  @media (max-width: 980px) {
    padding: 12px;
  }

  @media (max-width: 720px) {
    padding: 0;
    gap: 14px;
  }
`;

const AuthCard = styled.section`
  background: var(--panel);
  border-radius: 24px;
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: none;
  width: 100%;

  @media (max-width: 720px) {
    max-width: none;
    padding: 12px;
    border-radius: 16px;
  }
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const AuthTextInput = styled(TextInput)`
  width: 100%;
  min-height: 48px;
`;

const PasswordInputWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 0 10px 0 14px;
  background: #fff;

  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(42, 158, 244, 0.15);
  }
`;

const PasswordInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.35;
  padding: 10px 0;
`;

const PasswordToggleButton = styled.button`
  border: none;
  background: transparent;
  color: var(--muted);
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 1;
  outline: none;
  margin-left: 8px;

  &:hover {
    color: var(--accent-dark);
    background: rgba(42, 158, 244, 0.12);
  }

  &:focus-visible {
    color: var(--accent-dark);
    box-shadow: 0 0 0 2px rgba(42, 158, 244, 0.25);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

// const OAuthButton = styled(SecondaryButton)`
//   width: 100%;
// `;

const AuthRight = styled.section`
  background: linear-gradient(160deg, rgba(42, 158, 244, 0.12), rgba(28, 127, 209, 0.08));
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 32px;
  display: flex;
  align-items: flex-end;
  min-height: 0;
  height: 100%;

  @media (max-width: 980px) {
    padding: 24px;
  }

  @media (max-width: 720px) {
    padding: 20px;
    border-radius: 16px;
    align-items: center;
  }
`;

const AuthRightInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AuthTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
`;

const AuthSubtitle = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 14px;
`;
