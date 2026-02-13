'use client';

import styled from 'styled-components';
import { MutedText } from './ui';

type StatusCardProps = {
  title: string;
  message: string;
};

export default function StatusCard({ title, message }: StatusCardProps) {
  return (
    <CardShell>
      <CardTitle>{title}</CardTitle>
      <MutedText>{message}</MutedText>
    </CardShell>
  );
}

const CardShell = styled.section`
  max-width: 420px;
  width: 100%;
  align-self: center;
  background: var(--panel);
  border-radius: 24px;
  border: 1px solid var(--border);
  padding: 32px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;

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
