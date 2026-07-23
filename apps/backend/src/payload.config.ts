import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { networkInterfaces } from 'os';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { env } from './env';
import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Footer } from './globals/Footer';
import { Header } from './globals/Header';

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
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  globals: [Header, Footer],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // No migrations are committed yet. On review/staging DBs, set DB_PUSH=true to
    // let Payload auto-sync the schema on boot. Off by default — production must
    // use real migrations, never implicit push.
    push: env.DB_PUSH === 'true',
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [],
});
