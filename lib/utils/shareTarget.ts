import {
  SHARE_QUERY_TEXT_KEY,
  SHARE_QUERY_TITLE_KEY,
  SHARE_QUERY_URL_KEY,
  SHARE_TARGET_FORM_TEXT_KEY,
  SHARE_TARGET_FORM_TITLE_KEY,
  SHARE_TARGET_FORM_URL_KEY
} from '../constants/pwa';

type SharedPayload = {
  title: string;
  text: string;
  url: string;
};

type SharedPayloadInput = {
  title: string | null | undefined;
  text: string | null | undefined;
  url: string | null | undefined;
};

const getTrimmedString = (value: string | null | undefined) => value?.trim() ?? '';

const isHttpUrl = (value: string) => {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_error) {
    return false;
  }
};

const getFormValue = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toSharedPayload = ({ title, text, url }: SharedPayloadInput): SharedPayload => {
  const trimmedTitle = getTrimmedString(title);
  const trimmedText = getTrimmedString(text);
  const trimmedUrl = getTrimmedString(url);

  return {
    title: trimmedTitle,
    text: trimmedText,
    url: isHttpUrl(trimmedUrl) ? trimmedUrl : ''
  };
};

export const getSharedPayloadFromFormData = (formData: FormData) =>
  toSharedPayload({
    title: getFormValue(formData.get(SHARE_TARGET_FORM_TITLE_KEY)),
    text: getFormValue(formData.get(SHARE_TARGET_FORM_TEXT_KEY)),
    url: getFormValue(formData.get(SHARE_TARGET_FORM_URL_KEY))
  });

export const getSharedPayloadFromSearchParams = (searchParams: URLSearchParams) =>
  toSharedPayload({
    title: searchParams.get(SHARE_QUERY_TITLE_KEY),
    text: searchParams.get(SHARE_QUERY_TEXT_KEY),
    url: searchParams.get(SHARE_QUERY_URL_KEY)
  });

export const getShareTargetRedirectSearchParams = (sharedPayload: SharedPayload) => {
  const searchParams = new URLSearchParams();

  if (sharedPayload.title) {
    searchParams.set(SHARE_QUERY_TITLE_KEY, sharedPayload.title);
  }

  if (sharedPayload.text) {
    searchParams.set(SHARE_QUERY_TEXT_KEY, sharedPayload.text);
  }

  if (sharedPayload.url) {
    searchParams.set(SHARE_QUERY_URL_KEY, sharedPayload.url);
  }

  return searchParams;
};

export const getSharedDraft = ({ title, text, url }: SharedPayload) => {
  if (url) {
    return url;
  }

  if (text) {
    return text;
  }

  return title;
};
