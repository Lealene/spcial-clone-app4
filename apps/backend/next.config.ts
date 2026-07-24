import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mvp-realty/api-contracts'],
  // Allow LAN-origin browser sessions to use Next's dev-only HMR endpoint when
  // the Payload admin is opened through a local network address.
  allowedDevOrigins: ['192.168.1.*'],
  // Next.js 16.2 — forward browser console to the dev terminal so AI agents
  // (and humans tailing the terminal) catch client-side errors without
  // opening DevTools. Errors are forwarded by default; `true` forwards all.
  logging: {
    browserToTerminal: true,
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
