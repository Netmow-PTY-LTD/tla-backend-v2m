import { S3Client } from '@aws-sdk/client-s3';
import config from './index';

export const s3Client = new S3Client({
  region: config.do_spaces_region,
  endpoint: config.do_spaces_endpoint,
  credentials: {
    accessKeyId: config.do_spaces_access_key!,
    secretAccessKey: config.do_spaces_secret_key!,
  },
});
