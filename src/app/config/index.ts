import dotenv from 'dotenv';
import path from 'path';
import { envConfigLoader } from '../module/EnvConfig/envConfig.loader';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

/**
 * Helper function to get environment configuration.
 * Priority: Database (via envConfigLoader) > Local .env (process.env)
 */
const getEnv = (key: string): string | undefined => {
  return envConfigLoader.getConfig(key) || process.env[key];
};

export default {
  NODE_ENV: getEnv('NODE_ENV'),
  port: getEnv('PORT'),
  database_url: getEnv('DATABASE_URL'),
  bcrypt_salt_rounds: getEnv('BCRYPT_SALT_ROUNDS'),
  default_password: getEnv('DEFAULT_PASS'),
  jwt_access_secret: getEnv('JWT_ACCESS_SECRET'),
  jwt_refresh_secret: getEnv('JWT_REFRESH_SECRET'),
  jwt_access_expires_in: getEnv('JWT_ACCESS_EXPIRES_IN'),
  jwt_refresh_expires_in: getEnv('JWT_REFRESH_EXPIRES_IN'),
  reset_pass_ui_link: getEnv('RESET_PASS_UI_LINK'),
  admin_email: getEnv('ADMIN_EMAIL'),
  admin_password: getEnv('ADMIN_PASSWORD'),
  mailgun_smtp_user: getEnv('MAILGUN_SMTP_USER'),
  mailgun_smtp_password: getEnv('MAILGUN_SMTP_PASS'),
  mailgun_from_email_address: getEnv('MAILGUN_FROM_EMAIL'),
  cloudinary_cloud_name: getEnv('CLOUDINARY_CLOUD_NAME'),
  cloudinary_api_key: getEnv('CLOUDINARY_API_KEY'),
  cloudinary_api_secret: getEnv('CLOUDINARY_API_SECRET'),
  client_url: getEnv('CLIENT_SITE_URL'),
  do_spaces_access_key: getEnv('DO_SPACES_ACCESS_KEY'),
  do_spaces_secret_key: getEnv('DO_SPACES_SECRET_KEY'),
  do_spaces_region: getEnv('DO_SPACES_REGION'),
  do_spaces_endpoint: getEnv('DO_SPACES_ENDPOINT'),
  do_spaces_bucket: getEnv('DO_SPACES_BUCKET'),
  firm_reset_pass_ui_link: getEnv('FIRM_RESET_PASS_UI_LINK'),
  firm_client_url: getEnv('FIRM_CLIENT_URL'),
  google_maps_api_key: getEnv('GOOGLE_MAPS_API_KEY'),
  redis_host: getEnv('REDIS_HOST'),
  redis_port: getEnv('REDIS_PORT'),
  redis_password: getEnv('REDIS_PASSWORD'),
  redis_username: getEnv('REDIS_USERNAME'),
  custom_cdn_domain: getEnv('CUSTOM_CDN_DOMAIN'),
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