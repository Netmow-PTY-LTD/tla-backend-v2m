

import { transporter } from "../config/emailTranspoter";
import { getAppSettings } from "../module/Settings/utils/settingsConfig";
import { congratulationsLawyerPromotion, emailVerificationTemplate, interactionEmail, leadEmailTemplate, otpEmail, passwordResetEmail, publicContactEmail, welcomeLawyerEmail, welcomeLeadSubmitted } from "./templates/template";


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
  if (!settings.emailProviderEnabled) {
    console.log('📧 Email provider is disabled. Skipping email.');
    return;
  }

  let html;
  if(emailTemplate=='welcome_to_client'){
   html=  welcomeLeadSubmitted(data)
  }

  if(emailTemplate =="welcome_to_lawyer"){
    html=welcomeLawyerEmail(data)
  }
  if(emailTemplate==="contact"){
    html=interactionEmail(data)
  }
  if(emailTemplate==="public-contact"){
    html=publicContactEmail(data)
  }
  if(emailTemplate =="lawyer_response_to_lead"){

  }
  if(emailTemplate =="client_sent_text_to_lawyer"){

  }
  if(emailTemplate =="lawyer_sent_text_to_client"){

  }
  
  if(emailTemplate =="verify_email"){
    emailTemplate=emailVerificationTemplate(data)
  }


  if(emailTemplate =="newLeads"){
    html=leadEmailTemplate(data)

  }
  if(emailTemplate =="password_reset"){
    html=passwordResetEmail(data)
  }
  if(emailTemplate =="otp_email"){
    html=otpEmail(data)
  }

  if(emailTemplate =="lawyerPromotion"){
    html=congratulationsLawyerPromotion(data)

  }

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
    console.log('error ===>',error)
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
