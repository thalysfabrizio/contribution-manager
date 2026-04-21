import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    // URLs de logo/banner de campanha e avatar OAuth são user-provided.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

const sentryEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: process.env.CI !== 'true',
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: false,
    })
  : nextConfig;
