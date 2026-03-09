/* eslint-disable @typescript-eslint/no-explicit-any */


import { transporter } from "../config/emailTranspoter";
import { getAppSettings } from "../module/Settings/settingsConfig";
import { firmPasswordResetEmail, firmRegisterEmail, newClaimNotificationEmail, requestlawyerAsFirmMember } from "./templates/firmTemplate";
import { congratulationsLawyerPromotion, emailVerificationTemplate, footerDesign, headerDesign, interactionEmail, lawyerApprval, newLeadAlertToLawyer, otpEmail, passwordResetEmail, publicContactEmail, welcomeClientEmail, welcomeLawyerEmail, welcomeLawyerEmailByMarketing, welcomeLeadSubmitted } from "./templates/template";
import { adminCampaignTemplate } from "./templates/adminCampaignTemplate";
import { subscriptionCanceledEmail, subscriptionChangedEmail, subscriptionCreatedEmail, subscriptionExpiredEmail, subscriptionPaymentFailedEmail, subscriptionRenewalReminderEmail, subscriptionRenewedEmail } from "./templates/subscriptionTemplates";
import { EmailTemplateService } from "../module/emailTemplateSystem/emailTemplate.service";
import { interpolate } from "../module/emailTemplateSystem/emailTemplate.utils";


export interface SendEmailParams {
  // --- Recipient Info ---
  to: string;
  replyTo?: string;

  // --- Template Info ---
  emailTemplate?: string;
  data?: any; // Dynamic data for template interpolation

  // --- Manual Content (Overrides template) ---
  subject?: string;
  text?: string;
}

const hardcodedTemplates: Record<string, (data?: any) => string> = {
  welcome_Lead_submission: welcomeLeadSubmitted,
  welcome_to_client: welcomeClientEmail,
  welcome_to_lawyer: welcomeLawyerEmail,
  welcome_to_lawyer_by_marketer: welcomeLawyerEmailByMarketing,
  contact: interactionEmail,
  "public-contact": publicContactEmail,
  verify_email: emailVerificationTemplate,
  new_lead_alert: newLeadAlertToLawyer,
  password_reset: passwordResetEmail,
  otp_email: otpEmail,
  lawyerPromotion: congratulationsLawyerPromotion,
  lawyer_approved: lawyerApprval,
  firm_password_reset: firmPasswordResetEmail,
  request_lawyer_as_firm_member: requestlawyerAsFirmMember,
  firm_registration: firmRegisterEmail,
  new_claim_notification: newClaimNotificationEmail,
  admin_custom: adminCampaignTemplate,
  subscription_created: subscriptionCreatedEmail,
  subscription_renewed: subscriptionRenewedEmail,
  subscription_payment_failed: subscriptionPaymentFailedEmail,
  subscription_canceled: subscriptionCanceledEmail,
  subscription_changed: subscriptionChangedEmail,
  subscription_renewal_reminder: subscriptionRenewalReminderEmail,
  subscription_expired: subscriptionExpiredEmail,
};


export const sendEmail = async ({
  to,
  replyTo,
  emailTemplate,
  data,
  subject,
  text,
}: SendEmailParams) => {

  const settings = await getAppSettings();

  if (!settings || !settings.emailProviderEnabled) {
    // eslint-disable-next-line no-console
    console.log('📧 Email provider is disabled. Skipping email.');
    return;
  }

  let html: string | undefined;
  let finalSubject = subject || '';

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
  if (!html && emailTemplate) {
    const templateRenderer = hardcodedTemplates[emailTemplate];
    if (templateRenderer) {
      html = templateRenderer(data);
    } else {
      console.warn(`⚠️ Warning: No fallback hardcoded template found for '${emailTemplate}'`);
    }
  }

  const mailOptions = {
    // from: config.mailgun_from_email_address, // e.g. "My App <noreply@yourdomain.com>"
    from: "TheLawApp <noreply@thelawapp.com.au>",
    to,
    replyTo,
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
