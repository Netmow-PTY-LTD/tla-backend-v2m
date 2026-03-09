/* eslint-disable @typescript-eslint/no-explicit-any */

import { firmPasswordResetEmail, firmRegisterEmail, newClaimNotificationEmail, requestlawyerAsFirmMember } from "./templates/firmTemplate";
import { congratulationsLawyerPromotion, emailVerificationTemplate, footerDesign, headerDesign, interactionEmail, lawyerApprval, newLeadAlertToLawyer, otpEmail, passwordResetEmail, publicContactEmail, welcomeClientEmail, welcomeLawyerEmail, welcomeLawyerEmailByMarketing, welcomeLeadSubmitted } from "./templates/template";
import { adminCampaignTemplate } from "./templates/adminCampaignTemplate";
import { subscriptionCanceledEmail, subscriptionChangedEmail, subscriptionCreatedEmail, subscriptionExpiredEmail, subscriptionPaymentFailedEmail, subscriptionRenewalReminderEmail, subscriptionRenewedEmail } from "./templates/subscriptionTemplates";
import { EmailTemplateService } from "../emailSystem/emailTemplate.service";
import { interpolate } from "../emailSystem/emailTemplate.utils";
import { getAppSettings } from "../Settings/settingsConfig";
import { transporter } from "../../config/emailTranspoter";


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

  let html: string | undefined;
  let finalSubject = subject;

  // 1. Try to fetch template from database
  if (emailTemplate) {
    try {
      const dbTemplate = await EmailTemplateService.getEmailTemplateByTemplateKeyFromDB(emailTemplate);
      if (dbTemplate && dbTemplate.isActive) {
        finalSubject = subject ? subject : interpolate(dbTemplate.subject, data);
        const interpolatedBody = interpolate(dbTemplate.body, data);

        // Wrap with layout if it's not a full HTML document
        if (!interpolatedBody.includes('<html')) {
          html = `${headerDesign} ${interpolatedBody} ${footerDesign}`;
        } else {
          html = interpolatedBody;
        }
      }
    } catch (error) {
      console.error(`Error fetching email template ${emailTemplate} from DB:`, error);
      // continue to fallback logic
    }
  }

  // 2. Fallback to hardcoded templates if DB template is not found
  if (!html) {
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



  }




  const mailOptions = {
    // from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
    from: "TheLawApp <noreply@thelawapp.com.au>",
    to,
    subject: finalSubject,
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

