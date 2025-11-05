import config from '../../config';

const appName = 'TheLawApp';
const headerDesign = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Welcome Lawyer</title>
 <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
      line-height: 1.6;
    }
    a {
      text-decoration: none;
    }
    h3 {
      margin: 20px 0 10px;
      font-size: 18px;
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    p {
      margin: 0 0 8px;
      font-size: 15px;
      color: #111;
    }
    span.im {
       color: #555 !important;
      }
  </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; ">
        <!-- Logo -->
        <tr>
            <td align="center" style="padding: 20px 0;">
                <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
            </td>
        </tr>`;

const footerDesign = ` 
        <tr>
      <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
        <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
          <!-- Social Icons -->
   
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 15px;">
      <tr>
       <td style="padding: 0 8px;">
  <a href="https://www.facebook.com/thelawapp" target="_blank">
    <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/fb.png" alt="Facebook" width="30" height="30" style="display: block;" />
  </a>
</td>


<td style="padding: 0 8px;">
  <a href="https://www.linkedin.com/in/the-law-app-22b048166" target="_blank">
    <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/linkedin.png" alt="LinkedIn" width="30" height="30" style="display: block;" />
  </a>
</td>

<td style="padding: 0 8px;">
  <a href="https://x.com/TheLawAppOnline" target="_blank">
    <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/x.png" alt="Twitter" width="30" height="30" style="display: block;" />
  </a>
</td>
        
      </tr>
    </table>
        <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
            You are receiving this email because you registered on TheLawApp as a legal professional.</p>
        <p style="margin: 0;">
          <a href="${config.client_url}/privacy-policy" style="color: #999; margin-right: 5px;">Privacy Policy</a> •
          <a href="${config.client_url}/terms" style="color: #999; margin-left: 5px; margin-right: 5px;">Terms</a> •
          <a href="${config.client_url}/trust-and-quality" style="color:#999; margin-left: 5px; margin-right: 5px;">Trust and Quality</a> •
          <a href="${config.client_url}/faq" style="color: #999; margin-left: 5px; margin-right: 5px;">FAQs</a> •
          <a href="${config.client_url}/disclaimer" style="color: #999; margin-left: 5px;">Disclaimer</a>
        </p>
      </td>
    </tr>
    </table>
</body>
</html>`;




//  Rest password email template

export const firmPasswordResetEmail = (data: {
    name: string;
    resetUrl: string;
}) => {
    const { name, resetUrl } = data;

    return `
${headerDesign}

    <!-- Greeting -->
    <tr>
      <td style="padding: 0 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          You have requested us to send a link to reset your password for your TheLawApp account. Click on the button below to proceed.
        </p>
        <!-- Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetUrl}" style="background-color:#FF7F27; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
            Reset password
          </a>
        </div>
        <p style="font-size: 14px; color: #555;">
          If you didn’t initiate this request, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; margin-top: 20px;">
          Best Regards,<br>
          <span style="color:#FF7F27; font-weight: bold;">TheLawApp Team</span>
        </p>
      </td>
    </tr>

   ${footerDesign}
  `;
};




export const requestlawyerAsFirmMember = (data: {
  lawyerName: string;
  lawyerEmail: string;
  role: string;
  requestUrl: string;
}) => {
  const { lawyerName, lawyerEmail, role, requestUrl } = data;

  return `
  ${headerDesign}

  <!-- Greeting -->
  <tr>
    <td style="padding: 0 30px;">
      <h2 style="font-size: 24px; margin-bottom: 20px;">New Lawyer Registration Request</h2>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        A new lawyer has requested to join your company on <strong>TheLawApp</strong>.
      </p>

      <!-- Lawyer Info -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="font-size: 15px; padding: 8px 0;"><strong>Name:</strong></td>
          <td style="font-size: 15px; padding: 8px 0;">${lawyerName}</td>
        </tr>
        <tr>
          <td style="font-size: 15px; padding: 8px 0;"><strong>Email:</strong></td>
          <td style="font-size: 15px; padding: 8px 0;">${lawyerEmail}</td>
        </tr>
        <tr>
          <td style="font-size: 15px; padding: 8px 0;"><strong>Role:</strong></td>
          <td style="font-size: 15px; padding: 8px 0;">${role}</td>
        </tr>
      </table>

      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Please review this request in your company dashboard to approve or reject the new member.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${requestUrl}"
           style="background-color:#FF7F27; color:#ffffff; text-decoration:none;
                  padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
          Review Request
        </a>
      </div>

      <p style="font-size: 14px; color: #555;">
        If you believe this message was sent in error, you can safely ignore it.
      </p>
      <p style="font-size: 14px; margin-top: 20px;">
        Best Regards,<br>
        <span style="color:#FF7F27; font-weight: bold;">TheLawApp Team</span>
      </p>
    </td>
  </tr>

  ${footerDesign}
  `;
};




// company Register email template
export const firmRegisterEmail = (data: {
    name: string;
    loginUrl: string;
    password: string;
    email: string;
}) => {
    const { name, loginUrl, password, email } = data;

    return `
    ${headerDesign}

    <!-- Greeting -->
    <tr>
      <td style="padding: 0 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          Welcome to TheLawApp! Your account has been created successfully.
        </p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          You can log in using the following credentials:
        </p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          <strong>Email:</strong> ${email}<br>
          <strong>Password:</strong> ${password}
        </p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          Click the button below to log in to your account.
        </p>
        <!-- Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginUrl}" style="background-color:#FF7F27; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
            Log In
          </a>
        </div>
        <p style="font-size: 14px; color: #555;">
          If you didn’t initiate this request, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; margin-top: 20px;">
          Best Regards,<br>
          <span style="color:#FF7F27; font-weight: bold;">TheLawApp Team</span>
        </p>
      </td>
    </tr>

   ${footerDesign}
  `;
};



//   newClaimNotificationEmail
export const newClaimNotificationEmail = (data: {
  claimId: string;
  lawFirmName: string;
  claimerName: string;
  issueDescription: string;
}) => {
  const { claimId, lawFirmName, claimerName, issueDescription } = data;

  return `
  ${headerDesign}

  <!-- Email Body -->
  <tr>
    <td style="padding: 0 30px;">
      <h2 style="font-size: 24px; margin-bottom: 20px; color: #222;">
        New Claim Submitted
      </h2>

      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        A new claim has been submitted by your <strong>Law Firm</strong> on <strong>TheLawApp</strong>. Below are the details:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px 0; font-size: 16px;"><strong>Claim ID:</strong></td>
          <td style="padding: 8px 0; font-size: 16px; color: #555;">${claimId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 16px;"><strong>Law Firm:</strong></td>
          <td style="padding: 8px 0; font-size: 16px; color: #555;">${lawFirmName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 16px;"><strong>Claimer Name:</strong></td>
          <td style="padding: 8px 0; font-size: 16px; color: #555;">${claimerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 16px; vertical-align: top;"><strong>Issue Description:</strong></td>
          <td style="padding: 8px 0; font-size: 16px; color: #555;">${issueDescription}</td>
        </tr>
      </table>

      <p style="font-size: 16px; line-height: 1.6;">
        Please review the claim details in the <strong>Admin Dashboard</strong> and take the necessary actions accordingly.

      </p>

      <p style="font-size: 14px; color: #777; margin-top: 25px;">
       You are receiving this email because you are registered as an administrator for <strong>${lawFirmName}</strong> on <strong>TheLawApp</strong> platform.
      </p>

      <p style="font-size: 14px; margin-top: 20px;">
        Best Regards,<br>
        <span style="color:#FF7F27; font-weight: bold;"><strong>TheLawApp</strong> <strong>Team</strong> </span>
      </p>
    </td>
  </tr>

  ${footerDesign}
  `;
};
