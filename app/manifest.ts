import type { MetadataRoute } from 'next';
import { BRAND_SUBTITLE, BRAND_TITLE } from '../lib/constants/branding';
import {
  PWA_BACKGROUND_COLOR,
  PWA_DISPLAY_MODE,
  PWA_ICON_192_SIZE,
  PWA_ICON_192_SRC,
  PWA_ICON_512_MASKABLE_SRC,
  PWA_ICON_512_SIZE,
  PWA_ICON_512_SRC,
  PWA_ICON_TYPE,
  PWA_ORIENTATION,
  PWA_SCOPE,
  PWA_SHORT_NAME,
  PWA_START_URL,
  PWA_THEME_COLOR,
  SHARE_TARGET_ENCTYPE,
  SHARE_TARGET_FORM_TEXT_KEY,
  SHARE_TARGET_FORM_TITLE_KEY,
  SHARE_TARGET_FORM_URL_KEY,
  SHARE_TARGET_METHOD,
  SHARE_TARGET_PATH
} from '../lib/constants/pwa';

export default function manifest(): MetadataRoute.Manifest {
  const shareTarget = {
    action: SHARE_TARGET_PATH,
    method: SHARE_TARGET_METHOD,
    enctype: SHARE_TARGET_ENCTYPE,
    params: {
      title: SHARE_TARGET_FORM_TITLE_KEY,
      text: SHARE_TARGET_FORM_TEXT_KEY,
      url: SHARE_TARGET_FORM_URL_KEY
    }
  } as unknown as NonNullable<MetadataRoute.Manifest['share_target']>;

  return {
    name: BRAND_TITLE,
    short_name: PWA_SHORT_NAME,
    description: BRAND_SUBTITLE,
    start_url: PWA_START_URL,
    scope: PWA_SCOPE,
    display: PWA_DISPLAY_MODE,
    orientation: PWA_ORIENTATION,
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    icons: [
      {
        src: PWA_ICON_192_SRC,
        sizes: PWA_ICON_192_SIZE,
        type: PWA_ICON_TYPE
      },
      {
        src: PWA_ICON_512_SRC,
        sizes: PWA_ICON_512_SIZE,
        type: PWA_ICON_TYPE
      },
      {
        src: PWA_ICON_512_MASKABLE_SRC,
        sizes: PWA_ICON_512_SIZE,
        type: PWA_ICON_TYPE,
        purpose: 'maskable'
      }
    ],
    share_target: shareTarget
  };
}
