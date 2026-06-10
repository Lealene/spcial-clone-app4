import type { NextConfig } from 'next';

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
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  // Next.js 16.2 — forward browser console to the dev terminal so AI agents
  // (and humans tailing the terminal) catch client-side errors without
  // opening DevTools. Errors are forwarded by default; `true` forwards all.
  logging: {
    browserToTerminal: true,
  },
};

export default nextConfig;
