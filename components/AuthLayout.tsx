'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { BRAND_SUBTITLE, BRAND_TITLE, AUTH_RIGHT_SUBTITLE, AUTH_RIGHT_TITLE } from '../lib/constants/branding';
import { BrandGroup, BrandSubtitle, BrandTitle, MutedText, PrimaryButton, SecondaryButton, TextInput } from './ui';

type AuthLayoutProps = {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  isAuthWorking: boolean;
};

export default function AuthLayout({ onSignIn, onSignUp, isAuthWorking }: AuthLayoutProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <FormStack>
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormStack>
          <ButtonRow>
            <PrimaryButton onClick={() => onSignIn(email, password)} disabled={isAuthWorking}>
              Sign in
            </PrimaryButton>
            <SecondaryButton onClick={() => onSignUp(email, password)} disabled={isAuthWorking}>
              Sign up
            </SecondaryButton>
          </ButtonRow>
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
  grid-template-columns: 320px 1fr;
  grid-template-rows: minmax(0, 1fr);
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(220px, 1fr);
    padding: 16px;
    gap: 16px;
  }

  @media (max-width: 720px) {
    padding: 12px;
    gap: 12px;
  }
`;

const AuthSidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  min-height: 0;

  @media (max-width: 720px) {
    padding: 20px;
  }
`;

const AuthCard = styled.section`
  background: var(--panel);
  border-radius: 24px;
  border: 1px solid var(--border);
  padding: 32px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 420px;
  width: 100%;

  @media (max-width: 720px) {
    padding: 24px;
    border-radius: 18px;
  }
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
`;

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

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
    border-radius: 16px;
    align-items: center;
  }
`;

const AuthRightInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
