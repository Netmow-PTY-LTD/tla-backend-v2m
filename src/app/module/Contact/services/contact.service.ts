
import { sendSMS } from '../../../config/smsTransporter';
import { sendEmail } from '../../../emails/email.service';
import { SendEmail } from '../models/SendEmail.model';
import { SendSMS } from '../models/SendSMS.model';

const sendContactMessage = async (
  userProfileId: string,
  payload: {
    toEmail?: string;
    toPhone?: string;
    subject: string;
    html?: string;
    message: string;
    leadId?: string;
    method: 'email' | 'sms';
  }
) => {
  const { toEmail, toPhone, subject, html, message, leadId, method } = payload;

  if (method === 'email' && toEmail) {
    try {
      const result = await sendEmail({ to: toEmail, subject, html });

      await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: userProfileId,
        leadId,
        status: 'sent',
      });

      return { message: 'Email sent successfully', data: result };
    } catch (error:any) {
      await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: userProfileId,
        leadId,
        status: 'failed',
        error: error.message,
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  if (method === 'sms' && toPhone) {
    try {
      const result = await sendSMS({ to: toPhone, message });

      await SendSMS.create({
        to: toPhone,
        message,
        sentBy: userProfileId,
        leadId,
        status: 'sent',
        provider: 'twilio',
        metadata: result,
      });

      return { message: 'SMS sent successfully', data: result };
    } catch (error:any) {
      await SendSMS.create({
        to: toPhone,
        message,
        sentBy: userProfileId,
        leadId,
        status: 'failed',
        provider: 'twilio',
        error: error.message,
      });

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  throw new Error('Invalid method or missing contact info');
};



export const contactservice = {
    sendContactMessage 
};
