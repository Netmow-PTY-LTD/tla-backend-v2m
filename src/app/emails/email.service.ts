

import { transporter } from "../config/emailTranspoter";
import { getAppSettings } from "../module/Settings/settingsConfig";
import { firmPasswordResetEmail, firmRegisterEmail, newClaimNotificationEmail, requestlawyerAsFirmMember } from "./templates/firmTemplate";
import { congratulationsLawyerPromotion, emailVerificationTemplate, interactionEmail, lawyerApprval, newLeadAlertToLawyer, otpEmail, passwordResetEmail, publicContactEmail, welcomeClientEmail, welcomeLawyerEmail, welcomeLawyerEmailByMarketing, welcomeLeadSubmitted } from "./templates/template";
import { adminCampaignTemplate } from "./templates/adminCampaignTemplate";
import { subscriptionCanceledEmail, subscriptionChangedEmail, subscriptionCreatedEmail, subscriptionExpiredEmail, subscriptionPaymentFailedEmail, subscriptionRenewalReminderEmail, subscriptionRenewedEmail } from "./templates/subscriptionTemplates";


interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  // html?: string;
  data?: any;
  replyTo?: string;
  emailTemplate?: string;
}



export const sendEmail = async ({
  to,
  subject,
  text,
  // html,
  data,
  emailTemplate
}: SendEmailParams) => {

  const settings = await getAppSettings();
  // if (!settings.emailProviderEnabled) {
  //   console.log('📧 Email provider is disabled. Skipping email.');
  //   return;
  // }

  if (!settings || !settings.emailProviderEnabled) {
    console.log('📧 Email provider is disabled. Skipping email.');
    return;
  }

  let html;
  if (emailTemplate == 'welcome_Lead_submission') {
    html = welcomeLeadSubmitted(data)
  }
  if (emailTemplate == 'welcome_to_client') {
    html = welcomeClientEmail(data)
  }

  if (emailTemplate == "welcome_to_lawyer") {
    html = welcomeLawyerEmail(data)
  }
  if (emailTemplate == "welcome_to_lawyer_by_marketer") {
    html = welcomeLawyerEmailByMarketing(data)
  }
  if (emailTemplate === "contact") {
    html = interactionEmail(data)
  }
  if (emailTemplate === "public-contact") {
    html = publicContactEmail(data)
  }

  if (emailTemplate == "verify_email") {
    html = emailVerificationTemplate(data)
  }

  if (emailTemplate == "new_lead_alert") {
    html = newLeadAlertToLawyer(data)

  }
  if (emailTemplate == "password_reset") {
    html = passwordResetEmail(data)
  }
  if (emailTemplate == "otp_email") {
    html = otpEmail(data)
  }

  if (emailTemplate == "lawyerPromotion") {
    html = congratulationsLawyerPromotion(data)

  }

  if (emailTemplate == "lawyer_approved") {
    html = lawyerApprval(data)

  }

  if (emailTemplate == "firm_password_reset") {
    html = firmPasswordResetEmail(data)

  }


  if (emailTemplate == "request_lawyer_as_firm_member") {
    html = requestlawyerAsFirmMember(data)

  }

  if (emailTemplate == 'firm_registration') {
    html = firmRegisterEmail(data)
  }

  if (emailTemplate == 'new_claim_notification') {
    html = newClaimNotificationEmail(data)
  }

  // Admin Custom
  if (emailTemplate === 'admin_custom') {
    html = adminCampaignTemplate(data);
  }

  // Subscription Lifecycle
  if (emailTemplate === 'subscription_created') html = subscriptionCreatedEmail(data);
  if (emailTemplate === 'subscription_renewed') html = subscriptionRenewedEmail(data);
  if (emailTemplate === 'subscription_payment_failed') html = subscriptionPaymentFailedEmail(data);
  if (emailTemplate === 'subscription_canceled') html = subscriptionCanceledEmail(data);
  if (emailTemplate === 'subscription_changed') html = subscriptionChangedEmail(data);
  if (emailTemplate === 'subscription_renewal_reminder') html = subscriptionRenewalReminderEmail(data);
  if (emailTemplate === 'subscription_expired') html = subscriptionExpiredEmail(data);



  const mailOptions = {
    // from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
    from: "TheLawApp <noreply@thelawapp.com.au>",
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










// ------------------- actual code base postpond ----------



// import { transporter } from "../config/emailTranspoter";
// import { getAppSettings } from "../module/Settings/utils/settingsConfig";


// interface SendEmailParams {
//   to: string;
//   subject: string;
//   text?: string;
//   html?: string;
//   replyTo?: string;
// }



// export const sendEmail = async ({
//   to,
//   subject,
//   text,
//   html,
// }: SendEmailParams) => {

//   const settings = await getAppSettings();
//   if (!settings.emailProviderEnabled) {
//     console.log('📧 Email provider is disabled. Skipping email.');
//     return;
//   }

//   const mailOptions = {
//     // from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
//     from: "The Law App <noreply@thelawapp.com.au>",
//     to,
//     subject,
//     text,
//     html,
//     headers: {
//       'X-Mailer': 'The Law App',
//     },
//   };

//   try {
//     const result = await transporter.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error('📧 Email sending failed:', error instanceof Error ? error.message : error);
//     throw new Error('Failed to send email');
//   }
// };
