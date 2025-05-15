import { S3Client } from '@aws-sdk/client-s3';
import config from './index';

export const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: config.digitalocean_origin_endpoint,
  credentials: {
    accessKeyId: config.digitalocean_space_access_key!,
    secretAccessKey: config.digitalocean_space_secrete_key!,
  },
});
