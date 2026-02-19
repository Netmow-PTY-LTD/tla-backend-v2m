import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { envConfigLoader } from '../module/EnvConfig/envConfig.loader';

/**
 * Helper function to get environment configuration.
 * Priority: Database (via envConfigLoader) > Local .env (process.env)
 */
const getEnv = (key: string): string | undefined => {
  return envConfigLoader.getConfig(key) || process.env[key];
};

export default {
  get NODE_ENV() { return getEnv('NODE_ENV'); },
  get port() { return getEnv('PORT'); },
  get database_url() { return getEnv('DATABASE_URL'); },
  get bcrypt_salt_rounds() { return getEnv('BCRYPT_SALT_ROUNDS'); },
  get default_password() { return getEnv('DEFAULT_PASS'); },
  get jwt_access_secret() { return getEnv('JWT_ACCESS_SECRET'); },
  get jwt_refresh_secret() { return getEnv('JWT_REFRESH_SECRET'); },
  get jwt_access_expires_in() { return getEnv('JWT_ACCESS_EXPIRES_IN'); },
  get jwt_refresh_expires_in() { return getEnv('JWT_REFRESH_EXPIRES_IN'); },
  get reset_pass_ui_link() { return getEnv('RESET_PASS_UI_LINK'); },
  get admin_email() { return getEnv('ADMIN_EMAIL'); },
  get admin_password() { return getEnv('ADMIN_PASSWORD'); },
  get mailgun_smtp_user() { return getEnv('MAILGUN_SMTP_USER'); },
  get mailgun_smtp_password() { return getEnv('MAILGUN_SMTP_PASS'); },
  get mailgun_from_email_address() { return getEnv('MAILGUN_FROM_EMAIL'); },
  get cloudinary_cloud_name() { return getEnv('CLOUDINARY_CLOUD_NAME'); },
  get cloudinary_api_key() { return getEnv('CLOUDINARY_API_KEY'); },
  get cloudinary_api_secret() { return getEnv('CLOUDINARY_API_SECRET'); },
  get client_url() { return getEnv('CLIENT_SITE_URL'); },
  get do_spaces_access_key() { return getEnv('DO_SPACES_ACCESS_KEY'); },
  get do_spaces_secret_key() { return getEnv('DO_SPACES_SECRET_KEY'); },
  get do_spaces_region() { return getEnv('DO_SPACES_REGION'); },
  get do_spaces_endpoint() { return getEnv('DO_SPACES_ENDPOINT'); },
  get do_spaces_bucket() { return getEnv('DO_SPACES_BUCKET'); },
  get firm_reset_pass_ui_link() { return getEnv('FIRM_RESET_PASS_UI_LINK'); },
  get firm_client_url() { return getEnv('FIRM_CLIENT_URL'); },
  get google_maps_api_key() { return getEnv('GOOGLE_MAPS_API_KEY'); },
  get redis_host() { return getEnv('REDIS_HOST'); },
  get redis_port() { return getEnv('REDIS_PORT'); },
  get redis_password() { return getEnv('REDIS_PASSWORD'); },
  get redis_username() { return getEnv('REDIS_USERNAME'); },
  get custom_cdn_domain() { return getEnv('CUSTOM_CDN_DOMAIN'); },
  get stripe_secret_key_test() { return getEnv('STRIPE_SECRET_KEY_TEST'); },
  get stripe_secret_key_live() { return getEnv('STRIPE_SECRET_KEY_LIVE'); },
  get stripe_webhook_secret_test() { return getEnv('STRIPE_WEBHOOK_SECRET_TEST'); },
  get stripe_webhook_secret_live() { return getEnv('STRIPE_WEBHOOK_SECRET_LIVE'); },
};








//   previous code

// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config({ path: path.join((process.cwd(), '.env')) });

// export default {
//   NODE_ENV: process.env.NODE_ENV,
//   port: process.env.PORT,
//   database_url: process.env.DATABASE_URL,
//   bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
//   default_password: process.env.DEFAULT_PASS,
//   jwt_access_secret: process.env.JWT_ACCESS_SECRET,
//   jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
//   jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
//   jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
//   reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
//   admin_email: process.env.ADMIN_EMAIL,
//   admin_password: process.env.ADMIN_PASSWORD,
//   mailgun_smtp_user: process.env.MAILGUN_SMTP_USER,
//   mailgun_smtp_password: process.env.MAILGUN_SMTP_PASS,
//   mailgun_from_email_address: process.env.MAILGUN_FROM_EMAIL,
//   cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
//   cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
//   client_url: process.env.CLIENT_SITE_URL,
//   do_spaces_access_key: process.env.DO_SPACES_ACCESS_KEY,
//   do_spaces_secret_key: process.env.DO_SPACES_SECRET_KEY,
//   do_spaces_region: process.env.DO_SPACES_REGION,
//   do_spaces_endpoint: process.env.DO_SPACES_ENDPOINT,
//   do_spaces_bucket: process.env.DO_SPACES_BUCKET,
//   firm_reset_pass_ui_link: process.env.FIRM_RESET_PASS_UI_LINK,
//   firm_client_url: process.env.FIRM_CLIENT_URL,
//   google_maps_api_key: process.env.GOOGLE_MAPS_API_KEY,
//   redis_host: process.env.REDIS_HOST,
//   redis_port: process.env.REDIS_PORT,
//   redis_password: process.env.REDIS_PASSWORD,
//   redis_username: process.env.REDIS_USERNAME,
//   custom_cdn_domain:process.env.CUSTOM_CDN_DOMAIN

// };