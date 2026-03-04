import config from '../../config';

const appName = 'TheLawApp';
const currentYear = new Date().getFullYear();
const LOGO = 'https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png';
const ORANGE = '#f68c1f';

const baseHeader = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${appName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#333;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:#ffffff;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
  <tr><td align="center" style="padding:20px 0;"><img src="${LOGO}" alt="${appName}" width="190"/></td></tr>`;

const baseFooter = `
  <tr>
    <td align="center" style="padding:24px 20px;font-size:12px;color:#999;background:#f9f9f9;">
      <hr style="border:none;height:1px;background:#eee;margin-bottom:14px;"/>
      <p style="margin:0 0 8px;">© ${currentYear} ${appName}. All rights reserved.<br/>
      You are receiving this email because you have an account with ${appName}.</p>
      <p style="margin:0;">
        <a href="${config.client_url}/privacy-policy" style="color:#999;margin-right:4px;">Privacy Policy</a> •
        <a href="${config.client_url}/terms" style="color:#999;margin:0 4px;">Terms</a> •
        <a href="${config.client_url}/faq" style="color:#999;margin-left:4px;">FAQs</a>
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;

const ctaButton = (url: string, label: string) =>
    `<tr><td align="center" style="padding:16px 0;">
    <a href="${url}" style="background:${ORANGE};color:#fff;text-decoration:none;padding:11px 24px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">${label}</a>
  </td></tr>`;

const signoff = `<tr><td style="padding:0 28px 18px;font-size:15px;color:#333;">
  Best Regards,<br/><strong style="color:${ORANGE};">${appName} Team</strong>
</td></tr>`;

export const subscriptionCreatedEmail = (data: {
    name: string;
    planName: string;
    amount: string;
    currency: string;
    periodStart: string;
    periodEnd: string;
    invoicePdfUrl?: string;
    dashboardUrl: string;
}) => {
    const { name, planName, amount, currency, periodStart, periodEnd, invoicePdfUrl, dashboardUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#333;">🎉 Subscription Activated!</h2>
    <p style="margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;">Your <strong>${planName}</strong> subscription is now active. Here's a summary:</p>
    <table width="100%" cellpadding="8" style="background:#f9f9f9;border-radius:6px;font-size:14px;">
      <tr><td style="color:#666;">Plan:</td><td><strong>${planName}</strong></td></tr>
      <tr><td style="color:#666;">Amount:</td><td><strong>${amount} ${currency.toUpperCase()}</strong></td></tr>
      <tr><td style="color:#666;">Billing Start:</td><td>${periodStart}</td></tr>
      <tr><td style="color:#666;">Next Renewal:</td><td>${periodEnd}</td></tr>
      ${invoicePdfUrl ? `<tr><td style="color:#666;">Invoice:</td><td><a href="${invoicePdfUrl}" style="color:${ORANGE};">Download PDF</a></td></tr>` : ''}
    </table>
  </td></tr>
  ${ctaButton(dashboardUrl, 'Go to Dashboard')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionRenewedEmail = (data: {
    name: string;
    planName: string;
    amount: string;
    currency: string;
    nextRenewalDate: string;
    invoicePdfUrl?: string;
    dashboardUrl: string;
}) => {
    const { name, planName, amount, currency, nextRenewalDate, invoicePdfUrl, dashboardUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#333;">✅ Subscription Renewed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your <strong>${planName}</strong> subscription has been successfully renewed.</p>
    <table width="100%" cellpadding="8" style="background:#f9f9f9;border-radius:6px;font-size:14px;">
      <tr><td style="color:#666;">Plan:</td><td><strong>${planName}</strong></td></tr>
      <tr><td style="color:#666;">Amount Charged:</td><td><strong>${amount} ${currency.toUpperCase()}</strong></td></tr>
      <tr><td style="color:#666;">Next Renewal:</td><td>${nextRenewalDate}</td></tr>
      ${invoicePdfUrl ? `<tr><td style="color:#666;">Invoice:</td><td><a href="${invoicePdfUrl}" style="color:${ORANGE};">Download PDF</a></td></tr>` : ''}
    </table>
  </td></tr>
  ${ctaButton(dashboardUrl, 'View Dashboard')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionPaymentFailedEmail = (data: {
    name: string;
    planName: string;
    updatePaymentUrl: string;
}) => {
    const { name, planName, updatePaymentUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#c0392b;">⚠️ Payment Failed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We were unable to process your payment for the <strong>${planName}</strong> subscription.</p>
    <p style="background:#fff3f3;border-left:4px solid #c0392b;padding:10px 14px;border-radius:4px;font-size:14px;">
      Please update your payment method to avoid losing access to your subscription benefits.
    </p>
  </td></tr>
  ${ctaButton(updatePaymentUrl, 'Update Payment Method')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionCanceledEmail = (data: {
    name: string;
    planName: string;
    canceledAt: string;
    reactivateUrl: string;
}) => {
    const { name, planName, canceledAt, reactivateUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#333;">Subscription Canceled</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your <strong>${planName}</strong> subscription has been canceled as of <strong>${canceledAt}</strong>.</p>
  </td></tr>
  ${ctaButton(reactivateUrl, 'Reactivate Subscription')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionChangedEmail = (data: {
    name: string;
    oldPlanName: string;
    newPlanName: string;
    amount: string;
    currency: string;
    periodStart: string;
    periodEnd: string;
    dashboardUrl: string;
}) => {
    const { name, oldPlanName, newPlanName, amount, currency, periodStart, periodEnd, dashboardUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#333;">📦 Subscription Updated</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your subscription has been changed from <strong>${oldPlanName}</strong> to <strong>${newPlanName}</strong>.</p>
    <table width="100%" cellpadding="8" style="background:#f9f9f9;border-radius:6px;font-size:14px;">
      <tr><td style="color:#666;">New Plan:</td><td><strong>${newPlanName}</strong></td></tr>
      <tr><td style="color:#666;">Amount:</td><td><strong>${amount} ${currency.toUpperCase()}</strong></td></tr>
      <tr><td style="color:#666;">Effective Date:</td><td>${periodStart}</td></tr>
    </table>
  </td></tr>
  ${ctaButton(dashboardUrl, 'View Subscription')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionRenewalReminderEmail = (data: {
    name: string;
    planName: string;
    daysLeft: number;
    renewalDate: string;
    amount: string;
    currency: string;
    dashboardUrl: string;
}) => {
    const { name, planName, daysLeft, renewalDate, amount, currency, dashboardUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#333;">🔔 Subscription Renewal Reminder</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your <strong>${planName}</strong> subscription will renew in ${daysLeft} days on <strong>${renewalDate}</strong>.</p>
    <p>Renewal Amount: <strong>${amount} ${currency.toUpperCase()}</strong></p>
  </td></tr>
  ${ctaButton(dashboardUrl, 'Manage Subscription')}
  ${signoff}
  ${baseFooter}`;
};

export const subscriptionExpiredEmail = (data: {
    name: string;
    planName: string;
    expiredAt: string;
    reactivateUrl: string;
}) => {
    const { name, planName, expiredAt, reactivateUrl } = data;
    return `${baseHeader}
  <tr><td style="padding:24px 28px 0;">
    <h2 style="margin:0 0 10px;font-size:20px;color:#c0392b;">Subscription Expired</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your <strong>${planName}</strong> subscription expired on <strong>${expiredAt}</strong>.</p>
  </td></tr>
  ${ctaButton(reactivateUrl, 'Reactivate Now')}
  ${signoff}
  ${baseFooter}`;
};
