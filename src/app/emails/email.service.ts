import config from "../config";
import { transporter } from "../config/emailTranspoter";


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
    // from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
    from: "The Law App <noreply@thelawapp.com.au>",
    to,
    subject,
    text,
    html,
     headers: {
    'X-Mailer': 'The Law App',
  },
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
