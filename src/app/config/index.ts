import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
  mailgun_smtp_user: process.env.MAILGUN_SMTP_USER,
  mailgun_smtp_password: process.env.MAILGUN_SMTP_PASS,
  mailgun_from_email_address: process.env.MAILGUN_FROM_EMAIL,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  client_url: process.env.CLIENT_SITE_URL,
  do_spaces_access_key: process.env.DO_SPACES_ACCESS_KEY,
  do_spaces_secret_key: process.env.DO_SPACES_SECRET_KEY,
  do_spaces_region: process.env.DO_SPACES_REGION,
  do_spaces_endpoint: process.env.DO_SPACES_ENDPOINT, 
  do_spaces_bucket: process.env.DO_SPACES_BUCKET,
  firm_reset_pass_ui_link: process.env.FIRM_RESET_PASS_UI_LINK,
  firm_client_url: process.env.FIRM_CLIENT_URL,
  google_maps_api_key: process.env.GOOGLE_MAPS_API_KEY,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_password: process.env.REDIS_PASSWORD,
  redis_username: process.env.REDIS_USERNAME,

};
