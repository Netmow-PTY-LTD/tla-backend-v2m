import nodemailer from 'nodemailer';
import config from './index';

const transporter = nodemailer.createTransport({
  // host: 'smtp.mailgun.org',
  host: 'smtp.gmail.com',
  port: 587,
  // secure: config.NODE_ENV === 'production',
  secure: false,
  auth: {
    user: config.mailgun_smtp_user,
    pass: config.mailgun_smtp_password,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const mailOptions = {
    from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
    to,
    subject,
    text,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};
