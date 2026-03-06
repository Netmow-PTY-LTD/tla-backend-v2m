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

/**
 * Flexible wrapper for admin manual email campaigns
 */
export const adminCampaignTemplate = (data: {
    name: string;
    headline?: string;
    body: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerText?: string;
}) => {
    const { name, headline, body, ctaLabel, ctaUrl, footerText } = data;

    return `
  ${baseHeader}
  <tr>
    <td style="padding:24px 28px 20px;">
      <h2 style="margin:0 0 10px;font-size:20px;color:#333;">${headline || 'Hello from The Law App!'}</h2>
      <p style="margin:0 0 12px;font-size:15px;">Hi <strong>${name}</strong>,</p>
      <div style="font-size:15px;color:#444;line-height:1.6;">
        ${body.replace(/\n/g, '<br/>')}
      </div>
    </td>
  </tr>

  ${ctaLabel && ctaUrl ? `
  <tr>
    <td align="center" style="padding:10px 0 30px;">
      <a href="${ctaUrl}" style="background-color:${ORANGE};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
        ${ctaLabel}
      </a>
    </td>
  </tr>
  ` : ''}

  ${footerText ? `
  <tr>
    <td style="padding:0 28px 20px;font-size:13px;color:#777;">
      ${footerText}
    </td>
  </tr>
  ` : ''}

  <tr>
    <td style="padding:0 28px 24px;font-size:15px;color:#333;">
      Best Regards,<br/>
      <strong style="color:${ORANGE};">${appName} Team</strong>
    </td>
  </tr>
  ${baseFooter}
  `;
};
