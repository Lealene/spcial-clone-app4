import { postgresAdapter } from '@payloadcms/db-postgres';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { networkInterfaces } from 'os';
import path from 'path';
import type { Plugin } from 'payload';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Areas } from './collections/Areas';
import { Brokers } from './collections/Brokers';
import { Leads } from './collections/Leads';
import { Listings } from './collections/Listings';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { SyncLogs } from './collections/SyncLogs';
import { Users } from './collections/Users';
import { bridgeSyncEndpoint } from './endpoints/bridge-sync';
import { env, getS3Endpoint, hasEmailConfig, hasS3StorageConfig, isSmtpSecure } from './env';
import { Footer } from './globals/Footer';
import { Header } from './globals/Header';
import { mirrorListingHeroTask } from './jobs/mirror-listing-hero';
import { syncBridgeListingsTask } from './jobs/sync-bridge-listings';
import { syncLeadToWiseAgentTask } from './jobs/sync-lead-to-wise-agent';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getLocalNetworkOrigins(port: number) {
  return Object.values(networkInterfaces())
    .flatMap((interfaces) => interfaces ?? [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => `http://${address.address}:${port}`);
}

const serverUrl = new URL(env.PAYLOAD_PUBLIC_SERVER_URL);
const csrfOrigins = [serverUrl.origin, ...getLocalNetworkOrigins(Number(serverUrl.port || 3002))];

export default buildConfig({
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  csrf: csrfOrigins,
  // Ceiling for relationship population (request `depth` still defaults lower).
  // Raised so listing.area.broker.headshot can resolve at depth 3.
  maxDepth: 3,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/admin/SyncAllAreasButton'],
    },
  },
  collections: [Users, Media, Pages, Brokers, Areas, Listings, Leads, SyncLogs],
  globals: [Header, Footer],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Migrations are canonical. Enable schema push only on disposable databases
    // when intentionally developing a schema before its migration is generated.
    push: env.DB_PUSH === 'true',
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  sharp,
  // Omitted when SMTP is unset so Payload keeps its console-logging adapter and
  // local development boots without mail credentials.
  ...(hasEmailConfig()
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: env.EMAIL_FROM_ADDRESS!,
          defaultFromName: env.EMAIL_FROM_NAME,
          transportOptions: {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: isSmtpSecure(),
            auth: {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD,
            },
          },
        }),
      }
    : {}),
  endpoints: [bridgeSyncEndpoint],
  jobs: {
    // Autorun has no user session; queueing from sync also needs open access.
    // Manual HTTP trigger is gated by admin session or BRIDGE_SYNC_SECRET.
    access: {
      queue: () => true,
      run: () => true,
      cancel: ({ req }) => Boolean(req.user),
    },
    tasks: [syncBridgeListingsTask, mirrorListingHeroTask, syncLeadToWiseAgentTask],
    // autoRun drains queues; task.schedule queues the nightly sync onto `bridge`.
    autoRun: [
      { cron: '* * * * *', queue: 'bridge', limit: 5 },
      { cron: '* * * * *', queue: 'default', limit: 25 },
    ],
    deleteJobOnComplete: true,
  },
  plugins: [
    ...(hasS3StorageConfig()
      ? [
          s3Storage({
            collections: {
              media: {
                ...(env.S3_PUBLIC_URL
                  ? {
                      generateFileURL: ({ filename, prefix }) => {
                        const base = env.S3_PUBLIC_URL!.replace(/\/$/, '');
                        const pathPrefix = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
                        return `${base}/${pathPrefix}${filename}`;
                      },
                    }
                  : {}),
              },
            },
            bucket: env.S3_BUCKET!,
            // R2 ignores object ACLs — public reads come from bucket-level access / custom domain.
            config: {
              credentials: {
                accessKeyId: env.S3_ACCESS_KEY_ID!,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
              },
              region: env.S3_REGION,
              endpoint: getS3Endpoint(),
              forcePathStyle: true,
            },
          }) satisfies Plugin,
        ]
      : []),
  ],
});
