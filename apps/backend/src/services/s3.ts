import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { env, getS3Endpoint, hasS3StorageConfig } from '../env';

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!hasS3StorageConfig()) {
    throw new Error('S3 storage is not configured.');
  }

  if (!client) {
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: getS3Endpoint(),
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }

  return client;
}

export async function putPublicObject(args: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: args.key,
      Body: args.body,
      ContentType: args.contentType,
    }),
  );
}
