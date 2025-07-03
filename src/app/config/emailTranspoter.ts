import nodemailer from 'nodemailer';
import config from './index';

export const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  // secure: config.NODE_ENV === 'production',
  auth: {
    user: config.mailgun_smtp_user,
    pass: config.mailgun_smtp_password,
  },
});

