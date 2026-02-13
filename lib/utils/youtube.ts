import {
  YOUTUBE_ID_REGEX,
  YOUTUBE_THUMBNAIL_BASE_URL,
  YOUTUBE_WATCH_BASE_URL
} from '../constants/youtube';

export const getYouTubeVideoId = (content: string) => {
  const match = content.match(YOUTUBE_ID_REGEX);
  return match?.[1] ?? null;
};

export const getYouTubeThumbnailUrl = (videoId: string) =>
  `${YOUTUBE_THUMBNAIL_BASE_URL}/${videoId}/hqdefault.jpg`;

export const getYouTubeWatchUrl = (videoId: string) =>
  `${YOUTUBE_WATCH_BASE_URL}${videoId}`;
