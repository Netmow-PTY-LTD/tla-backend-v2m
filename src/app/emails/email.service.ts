
import { transporter } from "../config/emailTranspoter";
import { getAppSettings } from "../module/Settings/utils/settingsConfig";


interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}



export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams) => {

  const settings = await getAppSettings();
  if (!settings.emailProviderEnabled) {
    console.log('📧 Email provider is disabled. Skipping email.');
    return;
  }

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
    console.error('📧 Email sending failed:', error instanceof Error ? error.message : error);
    throw new Error('Failed to send email');
  }
};
