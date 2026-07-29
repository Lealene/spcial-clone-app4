import type { NextConfig } from 'next';

const backendUrl = new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3002');
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL)
  : null;
const backendHostAllowsLocalOptimization = ['localhost', '127.0.0.1', '::1'].includes(
  backendUrl.hostname,
);

const nextConfig: NextConfig = {
  transpilePackages: ['@mvp-realty/api-contracts', '@mvp-realty/ui'],
  // Dev-only. Next 16 blocks `/_next/*` dev resources (HMR + the hydration
  // runtime) for requests whose origin host isn't allow-listed, so hitting the
  // dev server via a LAN IP (phone/other device) leaves the page un-hydrated —
  // interactive components silently don't work. Allow common private ranges so
  // the Network URL works. Ignored in production builds.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*', '*.local', '*.ngrok-free.app'],
  // Design-exploration phase: lifestyle/portrait photography we don't own yet
  // is sourced from Unsplash. Swap for owned assets (or Payload Media) later.
  images: {
    dangerouslyAllowLocalIP: backendHostAllowsLocalOptimization,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Bridge MLS photo CDN (gallery hotlinks)
      { protocol: 'https', hostname: 'dvvjkgh94f2v6.cloudfront.net', pathname: '/**' },
      {
        protocol: backendUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: '/api/media/file/**',
      },
      // R2 / S3 public origin for mirrored heroes + CMS media
      ...(mediaUrl
        ? [
            {
              protocol: mediaUrl.protocol.replace(':', '') as 'http' | 'https',
              hostname: mediaUrl.hostname,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
  // Next.js 16.2 — forward browser console to the dev terminal so AI agents
  // (and humans tailing the terminal) catch client-side errors without
  // opening DevTools. Errors are forwarded by default; `true` forwards all.
  logging: {
    browserToTerminal: true,
  },
};

export default nextConfig;
