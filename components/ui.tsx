import styled from 'styled-components';

export const BrandGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const BrandTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`;

export const BrandSubtitle = styled.span`
  font-size: 14px;
  color: var(--muted);

  @media (max-width: 720px) {
    font-size: 13px;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

export const PanelMeta = styled.span`
  font-size: 13px;
  color: var(--muted);
`;

export const PanelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 720px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
`;

export const TextInput = styled.input`
  flex: 1;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 10px 12px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(42, 158, 244, 0.15);
  }
`;

export const TextArea = styled.textarea`
  min-height: 120px;
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 12px 14px;
  padding-right: 120px;
  padding-bottom: 54px;
  font-size: 14px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(42, 158, 244, 0.15);
  }

  @media (max-width: 720px) {
    padding-right: 96px;
    padding-bottom: 48px;
  }

  @media (max-width: 480px) {
    padding-right: 88px;
  }
`;

export const PrimaryButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover:enabled {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 16px;
  background: #fff;
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover:enabled {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 14px;
`;

export const MutedText = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 14px;
`;

export const ViewIcon = styled.svg`
  width: 16px;
  height: 16px;
`;
