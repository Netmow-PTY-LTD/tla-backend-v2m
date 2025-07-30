

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
import { getIO } from '../../../sockets';
import { IUser } from '../../Auth/interfaces/auth.interface';
import User from '../../Auth/models/auth.model';
import { IUserProfile } from '../../User/interfaces/user.interface';
import config from '../../../config';

//  -------------------- old code  ---------------------------------
// const sendContactMessage = async (
//   userId: string,
//   payload: {
//     toEmail?: string;
//     toPhone?: string;
//     subject: string;
//     emailText: string;
//     message: string;
//     leadId?: string;
//     responseId?: string;
//     method: 'email' | 'sms';
//     roomId: any
//   }
// ) => {
//   const user = await UserProfile.findOne({ user: userId }).select('_id');

//   if (!user) {
//     return sendNotFoundResponse('User profile not found');
//   }

//   const {
//     toEmail,
//     toPhone,
//     subject,
//     message,
//     leadId,
//     method,
//     responseId,
//     emailText,
//     roomId
//   } = payload;

//   const toUser = await User.findOne({ email: toEmail })
//     .select('email profile')
//     .populate<{ profile: IUserProfile }>('profile');
//   const objectId = responseId || leadId;
//   const io = getIO(); // Get socket instance


//   if (method === 'email' && toEmail) {
//     try {

//       const emailData = {
//         message: emailText,
//         name: toUser?.profile?.name || 'User',
//         userRole: toUser?.regUserType || 'client',
//         dashboardUrl: `${config.client_url}/lawyer/dashboard/my-responses?responseId=${responseId}`,
//         senderName: user.name || 'User',
//         timestamp: new Date().toLocaleString(),
//       };

//       const result = await sendEmail({
//         to: toEmail,
//         subject: "Contact with Lawyer or client",
//         data: emailData,
//         emailTemplate: "contact",
//       });

//       const resultDB = await SendEmail.create({
//         to: toEmail,
//         subject,
//         // html,
//         sentBy: user._id,
//         leadId,
//         text: emailText,
//         responseId,
//         status: 'sent',
//       });



//       await logActivity({
//         createdBy: userId,
//         activityNote: `Sent email to ${toEmail}`,
//         activityType: 'sendemail',
//         module: 'response',
//         objectId,
//         extraField: {
//           leadId,
//           responseId,
//           subject,
//           to: toEmail,
//         },
//       });

//       // Fetch lead to get recipient user
//       const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' })
//       // Type assertion to safely access user field
//       const populatedLeadUser = leadUser as typeof leadUser & {
//         userProfileId: {
//           _id: Types.ObjectId;
//           name: string;
//           user: Types.ObjectId;
//         };
//       };


//       if (populatedLeadUser?.userProfileId && typeof populatedLeadUser.userProfileId !== 'string') {
//         const recipientUserId = populatedLeadUser.userProfileId.user;
//         const recipientName = populatedLeadUser.userProfileId.name;

//         await createNotification({
//           userId: recipientUserId,
//           toUser: userId,
//           title: "You've received a new contact message",
//           message: `${user.name} sent you an email.`,
//           module: 'response',
//           type: 'sendemail',
//           link: `/lead/messages/${responseId}`,
//         });

//         // Real-time socket notification


//         io.to(`user:${recipientUserId}`).emit('notification', {
//           userId: recipientUserId,
//           toUser: userId,
//           title: "You've received a new contact message",
//           message: `${user.name} sent you an email.`,
//           module: 'response',
//           type: 'sendemail',
//           link: `/lead/messages/${responseId}`,
//         });


//         await createNotification({
//           userId,
//           toUser: recipientUserId,
//           title: "Your email was sent",
//           message: `You successfully sent an email to ${recipientName}.`,
//           module: 'response',
//           type: 'sendemail',
//           link: `/lawyer/responses/${responseId}`,
//         });

//         io.to(`user:${userId}`).emit('notification', {
//           userId,
//           toUser: recipientUserId,
//           title: "Your email was sent",
//           message: `You successfully sent an email to ${recipientName}.`,
//           module: 'response',
//           type: 'sendemail',
//           link: `/lawyer/responses/${responseId}`,
//         });

//       }



//       return { message: 'Email sent successfully', data: resultDB };
//     } catch (error: any) {
//       const html = `<p>${emailText}</p>`;
//       await SendEmail.create({
//         to: toEmail,
//         subject,
//         html,
//         sentBy: user._id,
//         leadId,
//         text: emailText,
//         responseId,
//         status: 'failed',
//         error: error.message,
//       });

//       await logActivity({
//         createdBy: userId,
//         activityNote: `Failed to send email to ${toEmail}`,
//         activityType: 'sendemail',
//         module: 'response',
//         objectId,
//         extraField: {
//           leadId,
//           responseId,
//           subject,
//           to: toEmail,
//           error: error.message,
//         },
//       });

//       // Notify sender via socket about failure
//       // io.to(roomId).emit('notification', {
//       //   type: 'email_failed',
//       //   message: `Failed to send email to ${toEmail}.`,
//       // });


//       // ✅ Notify sender of failure
//       await createNotification({
//         userId,
//         toUser: recipientUserId,
//         title: 'Failed to send email',
//         message: `We couldn’t send your email to ${toEmail}.`,
//         module: 'response',
//         type: 'failed_email',
//         link: `/lawyer/responses/${responseId}`,
//       });
//       throw new Error(`Failed to send email: ${error.message}`);
//     }
//   }

//   if (method === 'sms' && toPhone) {
//     try {
//       const result = await sendSMS({ to: '+8801407950926', message });

//       const resultSmsDB = await SendSMS.create({
//         to: toPhone,

//         message,
//         sentBy: user._id,
//         leadId,
//         responseId,
//         status: 'sent',
//         provider: 'twilio',
//         metadata: result,
//       });

//       // io.to(roomId).emit('notification', {
//       //   type: 'sms_sent',
//       //   message: `SMS sent to ${toPhone}`,
//       //   data: resultSmsDB,
//       // });

//       await logActivity({
//         createdBy: userId,
//         activityNote: `Sent SMS to ${toPhone}`,
//         activityType: 'sendsms',
//         module: 'response',
//         objectId,
//         extraField: {
//           leadId,
//           responseId,
//           to: toPhone,
//         },
//       });


//       const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' })
//       // Type assertion to safely access user field
//       const populatedLeadUser = leadUser as typeof leadUser & {
//         userProfileId: {
//           _id: Types.ObjectId;
//           name: string;
//           user: Types.ObjectId;
//         };
//       };



//       if (populatedLeadUser?.userProfileId && typeof populatedLeadUser.userProfileId !== 'string') {
//         const recipientUserId = populatedLeadUser.userProfileId.user;
//         const recipientName = populatedLeadUser.userProfileId.name;

//         await createNotification({
//           userId: recipientUserId,
//           toUser: userId,
//           title: "You've received a new contact message",
//           message: `${user.name} sent you an SMS.`,
//           module: 'response',
//           type: 'sendsms',
//           link: `/lead/messages/${responseId}`,
//         });

//         await createNotification({
//           userId,
//           toUser: recipientUserId,
//           title: "Your SMS was sent",
//           message: `You successfully sent an SMS to ${recipientName}.`,
//           module: 'response',
//           type: 'sendsms',
//           link: `/lawyer/responses/${responseId}`,
//         });
//       }



//       return { message: 'SMS sent successfully', data: resultSmsDB };
//     } catch (error: any) {
//       await SendSMS.create({
//         to: toPhone,
//         message,
//         sentBy: user._id,
//         leadId,
//         responseId,
//         status: 'failed',
//         provider: 'twilio',
//         error: error.message,
//       });

//       await logActivity({
//         createdBy: userId,
//         activityNote: `Failed to send SMS to ${toPhone}`,
//         activityType: 'sendsms',
//         module: 'response',
//         objectId,
//         extraField: {
//           leadId,
//           responseId,
//           to: toPhone,
//           error: error.message,
//         },
//       });

//       // io.to(roomId).emit('notification', {
//       //   type: 'sms_failed',
//       //   message: `Failed to send SMS to ${toPhone}.`,
//       // });




//       // ✅ Notify sender of failure
//       await createNotification({
//         userId,
//         toUser: recipientUserId,
//         title: 'Failed to send SMS',
//         message: `We couldn’t send your SMS to ${toPhone}.`,
//         module: 'response',
//         type: 'failed_sms',
//         link: `/lawyer/responses/${responseId}`,
//       });

//       throw new Error(`Failed to send SMS: ${error.message}`);
//     }
//   }

//   throw new Error('Invalid method or missing contact info');
// };





//  -------------------- new code  ---------------------------------
type ContactPayload = {
  toEmail?: string;
  toPhone?: string;
  subject: string;
  emailText: string;
  message: string;
  leadId?: string;
  responseId?: string;
  method: 'email' | 'sms';
  roomId?: string;
};

export const sendContactMessage = async (
  userId: string,
  payload: ContactPayload
) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('name _id');
  if (!userProfile) return sendNotFoundResponse('User profile not found');

  const {
    toEmail,
    toPhone,
    subject,
    message,
    emailText,
    leadId,
    method,
    responseId,
  } = payload;

  const io = getIO();
  const objectId = responseId || leadId;

  const toUser = await User.findOne({ email: toEmail })
    .select('email regUserType profile')
    .populate<{ profile: IUserProfile }>('profile');

  const recipientUserId = toUser?._id;
  const recipientName = toUser?.profile?.name || 'Recipient';
  const sentByUserName = userProfile?.name || 'SentBy';

  const sendSocketNotification = (targetUserId: string, title: string, msg: string, type: string, link: string) => {
    io.to(`user:${targetUserId}`).emit('notification', {
      userId: targetUserId,
      toUser: userId,
      title,
      message: msg,
      module: 'response',
      type,
      link,
    });
  };

  try {
    if (method === 'email' && toEmail) {

      const emailData = {
        message: emailText,
        name: toUser?.profile?.name || 'User',
        userRole: toUser?.regUserType || 'client',
        dashboardUrl: `${config.client_url}/lawyer/dashboard/my-responses?responseId=${responseId}`,
        senderName: sentByUserName || 'User',
        timestamp: new Date().toLocaleString(),
      };

      const sendResult = await sendEmail({
        to: toEmail,
        subject: 'Contact with Lawyer or Client',
        data: emailData,
        emailTemplate: 'contact',
      });

      const emailRecord = await SendEmail.create({
        to: toEmail,
        subject,
        sentBy: userProfile._id,
        leadId,
        responseId,
        text: emailText,
        status: 'sent',
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Sent email to ${toUser?.profile?.name}`,
        activityType: 'sendemail',
        module: 'response',
        objectId,
        extraField: { leadId, responseId, subject, to: toEmail },
      });

      if (recipientUserId) {
        await createNotification({
          userId: recipientUserId,
          toUser: userId,
          title: "You've received a new contact message",
          message: `${userProfile.name} sent you an email.`,
          module: 'response',
          type: 'sendemail',
          link: `/lead/messages/${responseId}`,
        });

        sendSocketNotification(
          recipientUserId.toString(),
          "You've received a new contact message",
          `${userProfile.name} sent you an email.`,
          'sendemail',
          `/lead/messages/${responseId}`
        );

        await createNotification({
          userId,
          toUser: recipientUserId,
          title: 'Your email was sent',
          message: `You successfully sent an email to ${recipientName}.`,
          module: 'response',
          type: 'sendemail',
          link: `/lawyer/responses/${responseId}`,
        });

        sendSocketNotification(
          userId,
          'Your email was sent',
          `You successfully sent an email to ${recipientName}.`,
          'sendemail',
          `/lawyer/responses/${responseId}`
        );
      }

      return { message: 'Email sent successfully', data: emailRecord };
    }

    if (method === 'sms' && toPhone) {
      const smsResult = await sendSMS({ to: toPhone, message });

      const smsRecord = await SendSMS.create({
        to: toPhone,
        message,
        sentBy: userProfile._id,
        leadId,
        responseId,
        status: 'sent',
        provider: 'twilio',
        metadata: smsResult,
      });

      await logActivity({
        createdBy: userId,
        activityNote: `Sent SMS to ${recipientName}`,
        activityType: 'sendsms',
        module: 'response',
        objectId,
        extraField: { leadId, responseId, to: toPhone },
      });

      if (recipientUserId) {
        console.log('test block')
        await createNotification({
          userId: recipientUserId,
          toUser: userId,
          title: "You've received a new contact message",
          message: `${userProfile.name} sent you an SMS.`,
          module: 'response',
          type: 'sendsms',
          link: `/lead/messages/${responseId}`,
        });

        await createNotification({
          userId,
          toUser: recipientUserId,
          title: 'Your SMS was sent',
          message: `You successfully sent an SMS to ${recipientName}.`,
          module: 'response',
          type: 'sendsms',
          link: `/lawyer/responses/${responseId}`,
        });

        sendSocketNotification(
          recipientUserId.toString(),
          "You've received a new contact message",
          `${userProfile.name} sent you an SMS.`,
          'sendsms',
          `/lead/messages/${responseId}`
        );

        sendSocketNotification(
          userId,
          'Your SMS was sent',
          `You successfully sent an SMS to ${recipientName}.`,
          'sendsms',
          `/lawyer/responses/${responseId}`
        );
      }

      return { message: 'SMS sent successfully', data: smsRecord };
    }

    throw new Error('Invalid method or missing contact info');
  } catch (error: any) {
  

    throw new Error(`Failed to send ${method}: ${error.message}`);
  }
};
















interface IEmail {
  name: string;
  email: string;
  phone?: string;
  message: string;


}


const contactWithEmail = async (payload: IEmail) => {
  try {
    await sendEmail({
      to: "maksud.netmow@gmail.com",
      subject: `You have received a message from ${payload.name}`,
      data: payload,
      emailTemplate: "public-contact",
    });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : String(error),
    };
  }

}




const sendNotificationService = async (payload: any) => {
  if (!payload) {
    throw new Error('Payload is missing');
  }

  const { toUserId, text, leadId } = payload;

  if (!toUserId || !text || !leadId) {
    throw new Error('Missing required fields in payload');
  }
  const io = getIO();

  const data = {
    text,
    leadId,
    timestamp: Date.now(),
  };

  io.to(`user:${toUserId}`).emit('notification', data);


};

export const contactservice = {
  sendContactMessage,
  contactWithEmail,
  sendNotificationService
};


