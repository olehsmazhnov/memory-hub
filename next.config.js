const packageJson = require('./package.json');
const isProduction = process.env.NODE_ENV === 'production';
const appVersion = '0.1.15';

if (packageJson.version !== appVersion) {
  throw new Error(
    `Version mismatch: package.json (${packageJson.version}) must match next.config.js (${appVersion}).`
  );
}

const scriptSourceValue = isProduction
  ? "'self' 'unsafe-inline'"
  : "'self' 'unsafe-inline' 'unsafe-eval'";

const connectSourceValue = isProduction
  ? "'self' https://*.supabase.co wss://*.supabase.co"
  : "'self' https://*.supabase.co wss://*.supabase.co ws: http:";

const contentSecurityPolicy = `
  default-src 'self';
  script-src ${scriptSourceValue};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src ${connectSourceValue};
  manifest-src 'self';
  worker-src 'self' blob:;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
