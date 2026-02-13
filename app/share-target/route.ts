import { NextRequest, NextResponse } from 'next/server';
import {
  getSharedPayloadFromFormData,
  getSharedPayloadFromSearchParams,
  getShareTargetRedirectSearchParams
} from '../../lib/utils/shareTarget';

const APP_HOME_PATH = '/';

const getConfiguredAppOrigin = () => {
  const configuredAppOrigin = process.env.APP_ORIGIN?.trim();

  if (!configuredAppOrigin) {
    return null;
  }

  try {
    const parsedAppOrigin = new URL(configuredAppOrigin);
    const isHttpProtocol = parsedAppOrigin.protocol === 'http:';
    const isHttpsProtocol = parsedAppOrigin.protocol === 'https:';

    if (!isHttpProtocol && !isHttpsProtocol) {
      return null;
    }

    return parsedAppOrigin.origin;
  } catch (_error) {
    return null;
  }
};

const configuredAppOrigin = getConfiguredAppOrigin();

const getShareTargetRedirectUrl = (request: NextRequest, searchParams: URLSearchParams) => {
  const redirectOrigin = configuredAppOrigin ?? request.nextUrl.origin;
  const redirectUrl = new URL(APP_HOME_PATH, redirectOrigin);
  redirectUrl.search = searchParams.toString();
  return redirectUrl;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sharedPayload = getSharedPayloadFromFormData(formData);
    const searchParams = getShareTargetRedirectSearchParams(sharedPayload);
    const redirectUrl = getShareTargetRedirectUrl(request, searchParams);

    return NextResponse.redirect(redirectUrl, 303);
  } catch (_error) {
    const fallbackOrigin = configuredAppOrigin ?? request.nextUrl.origin;
    const fallbackUrl = new URL(APP_HOME_PATH, fallbackOrigin);
    return NextResponse.redirect(fallbackUrl, 303);
  }
}

export function GET(request: NextRequest) {
  const sharedPayload = getSharedPayloadFromSearchParams(request.nextUrl.searchParams);
  const searchParams = getShareTargetRedirectSearchParams(sharedPayload);
  const redirectUrl = getShareTargetRedirectUrl(request, searchParams);

  return NextResponse.redirect(redirectUrl, 303);
}
