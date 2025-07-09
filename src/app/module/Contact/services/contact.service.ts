
import { sendSMS } from '../../../config/smsTransporter';
import { sendEmail } from '../../../emails/email.service';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import UserProfile from '../../User/models/user.model';
import { SendEmail } from '../models/SendEmail.model';
import { SendSMS } from '../models/SendSMS.model';

const sendContactMessage = async (
  userId: string,
  payload: {
    toEmail?: string;
    toPhone?: string;
    subject: string;
    emailText: string;
    message: string;
    leadId?: string;
    responseId?: string;
    method: 'email' | 'sms';
  }
) => {

  const user = await UserProfile.findOne({ user: userId }).select('_id');

  if (!user) {
    return sendNotFoundResponse('User profile not found');
  }

  const { toEmail, toPhone, subject, message, leadId, method, responseId, emailText } = payload;

  if (method === 'email' && toEmail) {
    try {
      // neeed html format
      const html = emailText
      const result = await sendEmail({ to: toEmail, subject, html });

      await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: user?._id,
        leadId,
        responseId,
        status: 'sent',
      });

      return { message: 'Email sent successfully', data: result };
    } catch (error: any) {
      // neeed html format
      const html = emailText
      await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: user?._id,
        leadId,
        responseId,
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
        sentBy: user?._id,
        leadId,
        responseId,
        status: 'sent',
        provider: 'twilio',
        metadata: result,
      });

      return { message: 'SMS sent successfully', data: result };
    } catch (error: any) {
      await SendSMS.create({
        to: toPhone,
        message,
        sentBy: user?._id,
        leadId,
        responseId,
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
