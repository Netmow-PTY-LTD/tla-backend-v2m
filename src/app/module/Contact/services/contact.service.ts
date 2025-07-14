

import { Types } from 'mongoose';
import { sendSMS } from '../../../config/smsTransporter';
import { sendEmail } from '../../../emails/email.service';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { logActivity } from '../../Activity/utils/logActivityLog';
import Lead from '../../Lead/models/lead.model';
import { createNotification } from '../../Notification/utils/createNotification';
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

  const {
    toEmail,
    toPhone,
    subject,
    message,
    leadId,
    method,
    responseId,
    emailText,
  } = payload;

  const objectId = responseId || leadId;

  if (method === 'email' && toEmail) {
    try {
      const html = `<p>${emailText}</p>`;
      const result = await sendEmail({ to: toEmail, subject, html });

      const resultDB = await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: user._id,
        leadId,
        text: emailText,
        responseId,
        status: 'sent',
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Sent email to ${toEmail}`,
        activityType: 'sendemail',
        module: 'response',
        objectId,
        extraField: {
          leadId,
          responseId,
          subject,
          to: toEmail,
        },
      });

      // Fetch lead to get recipient user
      const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' })
      // Type assertion to safely access user field
      const populatedLeadUser = leadUser as typeof leadUser & {
        userProfileId: {
          _id: Types.ObjectId;
          name: string;
          user: Types.ObjectId;
        };
      };


      if (populatedLeadUser?.userProfileId && typeof populatedLeadUser.userProfileId !== 'string') {
        const recipientUserId = populatedLeadUser.userProfileId.user;
        const recipientName = populatedLeadUser.userProfileId.name;

        await createNotification({
          userId: recipientUserId,
          title: "You've received a new contact message",
          message: `${user.name} sent you an email.`,
          module: 'response',
          type: 'sendemail',
          link: `/lead/messages/${responseId}`,
        });

        await createNotification({
          userId,
          title: "Your email was sent",
          message: `You successfully sent an email to ${recipientName}.`,
          module: 'response',
          type: 'sendemail',
          link: `/lawyer/responses/${responseId}`,
        });
      }

      return { message: 'Email sent successfully', data: resultDB };
    } catch (error: any) {
      const html = `<p>${emailText}</p>`;
      await SendEmail.create({
        to: toEmail,
        subject,
        html,
        sentBy: user._id,
        leadId,
        text: emailText,
        responseId,
        status: 'failed',
        error: error.message,
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Failed to send email to ${toEmail}`,
        activityType: 'sendemail',
        module: 'response',
        objectId,
        extraField: {
          leadId,
          responseId,
          subject,
          to: toEmail,
          error: error.message,
        },
      });

      // ✅ Notify sender of failure
      await createNotification({
        userId,
        title: 'Failed to send email',
        message: `We couldn’t send your email to ${toEmail}.`,
        module: 'response',
        type: 'failed_email',
        link: `/lawyer/responses/${responseId}`,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  if (method === 'sms' && toPhone) {
    try {
      const result = await sendSMS({ to: toPhone, message });

      const resultSmsDB = await SendSMS.create({
        to: toPhone,
        message,
        sentBy: user._id,
        leadId,
        responseId,
        status: 'sent',
        provider: 'twilio',
        metadata: result,
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Sent SMS to ${toPhone}`,
        activityType: 'sendsms',
        module: 'response',
        objectId,
        extraField: {
          leadId,
          responseId,
          to: toPhone,
        },
      });


      const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' })
      // Type assertion to safely access user field
      const populatedLeadUser = leadUser as typeof leadUser & {
        userProfileId: {
          _id: Types.ObjectId;
          name: string;
          user: Types.ObjectId;
        };
      };



      if (populatedLeadUser?.userProfileId && typeof populatedLeadUser.userProfileId !== 'string') {
        const recipientUserId = populatedLeadUser.userProfileId.user;
        const recipientName = populatedLeadUser.userProfileId.name;

        await createNotification({
          userId: recipientUserId,
          title: "You've received a new contact message",
          message: `${user.name} sent you an SMS.`,
          module: 'response',
          type: 'sendsms',
          link: `/lead/messages/${responseId}`,
        });

        await createNotification({
          userId,
          title: "Your SMS was sent",
          message: `You successfully sent an SMS to ${recipientName}.`,
          module: 'response',
          type: 'sendsms',
          link: `/lawyer/responses/${responseId}`,
        });
      }



      return { message: 'SMS sent successfully', data: resultSmsDB };
    } catch (error: any) {
      await SendSMS.create({
        to: toPhone,
        message,
        sentBy: user._id,
        leadId,
        responseId,
        status: 'failed',
        provider: 'twilio',
        error: error.message,
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Failed to send SMS to ${toPhone}`,
        activityType: 'sendsms',
        module: 'response',
        objectId,
        extraField: {
          leadId,
          responseId,
          to: toPhone,
          error: error.message,
        },
      });
      // ✅ Notify sender of failure
      await createNotification({
        userId,
        title: 'Failed to send SMS',
        message: `We couldn’t send your SMS to ${toPhone}.`,
        module: 'response',
        type: 'failed_sms',
        link: `/lawyer/responses/${responseId}`,
      });

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  throw new Error('Invalid method or missing contact info');
};

export const contactservice = {
  sendContactMessage,
};


