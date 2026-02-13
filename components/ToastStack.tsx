'use client';

import styled from 'styled-components';

type ToastStackProps = {
  errorMessage: string | null;
  infoMessage: string | null;
  onDismissError: () => void;
  onDismissInfo: () => void;
};

export default function ToastStack({
  errorMessage,
  infoMessage,
  onDismissError,
  onDismissInfo
}: ToastStackProps) {
  return (
    <ToastContainer aria-live="polite">
      {errorMessage ? (
        <Toast $isError role="alert">
          <ToastText>{errorMessage}</ToastText>
          <ToastDismiss type="button" onClick={onDismissError}>
            Dismiss
          </ToastDismiss>
        </Toast>
      ) : null}
      {infoMessage ? (
        <Toast role="status">
          <ToastText>{infoMessage}</ToastText>
          <ToastDismiss type="button" onClick={onDismissInfo}>
            Dismiss
          </ToastDismiss>
        </Toast>
      ) : null}
    </ToastContainer>
  );
}

const ToastContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;

  @media (max-width: 720px) {
    left: 16px;
    right: 16px;
  }
`;

const Toast = styled.div<{ $isError?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid ${({ $isError }) => ($isError ? '#d9544d' : '#2a9ef4')};
  background: ${({ $isError }) => ($isError ? '#ffe9e8' : '#e9f5ff')};
  color: ${({ $isError }) => ($isError ? 'var(--danger)' : 'var(--accent-dark)')};
  box-shadow: 0 12px 30px rgba(15, 31, 50, 0.15);
  min-width: 240px;
`;

const ToastText = styled.span`
  font-size: 14px;
`;

const ToastDismiss = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
`;
