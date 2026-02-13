import { NextRequest, NextResponse } from 'next/server';
import {
  getSharedPayloadFromFormData,
  getSharedPayloadFromSearchParams,
  getShareTargetRedirectSearchParams
} from '../../lib/utils/shareTarget';

const APP_HOME_PATH = '/';

const getShareTargetRedirectUrl = (request: NextRequest, searchParams: URLSearchParams) => {
  const redirectUrl = new URL(APP_HOME_PATH, request.url);
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
    const fallbackUrl = new URL(APP_HOME_PATH, request.url);
    return NextResponse.redirect(fallbackUrl, 303);
  }
}

export function GET(request: NextRequest) {
  const sharedPayload = getSharedPayloadFromSearchParams(request.nextUrl.searchParams);
  const searchParams = getShareTargetRedirectSearchParams(sharedPayload);
  const redirectUrl = getShareTargetRedirectUrl(request, searchParams);

  return NextResponse.redirect(redirectUrl, 303);
}
