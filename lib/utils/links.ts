import { URL_REGEX } from '../constants/links';

export const getContentLink = (content: string) => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return null;
  }

  if (!URL_REGEX.test(trimmedContent)) {
    return null;
  }

  if (trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')) {
    return trimmedContent;
  }

  return `https://${trimmedContent}`;
};
