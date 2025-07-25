
export const congratulationsLawyerPromotion = (data: {
  name: string;
  role: 'Expert Lawyer' | 'Premium Lawyer' | 'Verified Lawyer';
  dashboardUrl: string;
  appName: string;
}) => {
  const { name, role, dashboardUrl, appName } = data;

  let greeting = '';
  let features = '';

  if (role === 'Expert Lawyer') {
    greeting = `Welcome to the Expert Lawyer Circle, ${name}!`;
    features = `
      <li>Priority listing in search results</li>
      <li>Verified badge on your profile</li>
      <li>Access to premium client leads</li>`;
  } else if (role === 'Premium Lawyer') {
    greeting = `You've been upgraded to Premium Lawyer status, ${name}!`;
    features = `
      <li>Exclusive access to premium clients</li>
      <li>Profile promotion across the platform</li>
      <li>Faster client match algorithm</li>`;
  } else if (role === 'Verified Lawyer') {
    greeting = `Congratulations, ${name}! You're now a Verified Lawyer!`;
    features = `
      <li>Official verification badge for trust and credibility</li>
      <li>Higher visibility across client searches</li>
      <li>Access to verified-only leads and opportunities</li>`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Congratulations Email</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
    <table width="100%" cellpadding="0" cellspacing="0"
      style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd;">
      <tr>
        <td style="padding: 20px; text-align: center; background-color: #01c3bd; color: white;">
          <h1 style="margin: 0;">🎉 Congratulations!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px; color: #333;">
          <h2 style="margin-top: 0;">${greeting}</h2>

          <p style="line-height: 1.6;">
            We’re excited to let you know that your profile has officially been recognized as a
            <strong>${role}</strong> on <strong>${appName}</strong>.
          </p>

          <p style="line-height: 1.6;">
            Here’s what you unlock:
          </p>
          <ul style="padding-left: 20px;">
            ${features}
          </ul>

          <div style="margin: 30px 0; text-align: center;">
            <a href="${dashboardUrl}"
              style="background-color: #00c3c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
              Go to My Dashboard
            </a>
          </div>

          <p>If you have any questions or need help, reach out to us at <a href="mailto:support@thelawapp.com.au">
            support@thelawapp.com.au</a></p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; font-size: 12px; color: #999; padding: 20px;">
          © 2025 ${appName}. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};






export const newLeadAlertToLawyer = (data: {
  name: string; // e.g., "Andrea"
  service: string; // e.g., "Family Lawyer"
  location: string; // e.g., "Hawks Nest, NSW, 2324"
  phoneMasked: string; // e.g., "042* *** ***"
  emailMasked: string; // e.g., "a***********9@g***l.com"
  creditsRequired: number; // e.g., 6
  dashboardUrl: string;
  contactUrl: string;
  oneClickUrl: string;
  customResponseUrl: string;
  appName: string;
  projectDetails: {
    question: string;
    answer: string;
  }[];
}) => {
  const {
    name,
    service,
    location,
    phoneMasked,
    emailMasked,
    creditsRequired,
    dashboardUrl,
    contactUrl,
    oneClickUrl,
    customResponseUrl,
    appName,
    projectDetails
  } = data;

  const projectHtml = projectDetails
    .map(
      (item) => `
      <p><strong>${item.question}</strong><br>${item.answer}</p>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead Alert</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f9fc; color: #000;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd;">
    <tr>
      <td style="padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
        <img src="https://yourdomain.com/logo.png" alt="${appName} Logo" style="height: 40px;" />
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <h2 style="margin: 0 0 10px;">⚠️ ${name} is looking for a ${service}</h2>
        <p style="margin: 0 0 10px;">📍 ${location}</p>
        <p style="color: green; margin: 0 0 10px;">✅ Verified number</p>

        <p style="margin: 0;"><strong>📞</strong> ${phoneMasked}</p>
        <p style="margin: 5px 0 10px;"><strong>✉️</strong> ${emailMasked}</p>

        <p style="margin: 10px 0;"><strong>${creditsRequired} credits</strong> to respond</p>

        <div style="margin: 20px 0;">
          <a href="${oneClickUrl}"
            style="padding: 10px 15px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">One-click
            response</a>
          <a href="${customResponseUrl}"
            style="padding: 10px 15px; background-color: #e5e5e5; color: #333; text-decoration: none; border-radius: 5px;">Send
            custom response</a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <h3 style="margin-bottom: 10px;">Project Details</h3>
        ${projectHtml}

        <div style="margin: 20px 0;">
          <a href="${contactUrl}"
            style="padding: 10px 15px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Contact
            ${name}</a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <h3 style="margin-bottom: 10px;">Contact ${name} with 20% off your starter pack</h3>
        <p style="margin-bottom: 10px;">
          You’ll need credits to contact customers. Our discounted starter pack gives enough credits for about
          10 responses and is backed by our Get Hired Guarantee.
        </p>
        <p style="margin-bottom: 10px;">
          If you don’t get hired at least once from your starter pack, we’ll give you all your credits back.
        </p>
        <a href="${contactUrl}"
          style="padding: 10px 15px; background-color: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Contact
          ${name}</a>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; font-size: 12px; color: #999; padding: 20px;">
        © 2025 ${appName}. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`;
};





export const welcomeLeadSubmitted = (data: {
  name: string;
  caseType: string;
  involvedMembers: string;
  preferredServiceType: string;
  likelihoodOfHiring: string;
  preferredContactTime: string;
  dashboardUrl: string;
  appName: string;
  email?: string;
}) => {
  const {
    name,
    caseType,
    involvedMembers,
    preferredServiceType,
    likelihoodOfHiring,
    preferredContactTime,
    dashboardUrl,
    appName,
    email = 'support@yourdomain.com',
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome - Lead Submitted</title>
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
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    
    <!-- Logo -->
    <tr>
      <td align="center" style="padding: 20px 0; background: #ffffff;">
        <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="${appName} Logo" width="190" style="display: block;" />
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
        Hi ${name},
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding: 0 25px 20px; font-size: 15px; color: #555;">
        We're reviewing your case details and matching you with the right lawyer. You’ll be contacted shortly by a qualified legal professional.
      </td>
    </tr>

    <!-- Case Summary -->
    <tr>
      <td style="padding: 0 25px 25px;">
        <h3 style="margin: 20px 0 10px; font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          📝 Case Summary
        </h3>
        <p style="margin: 0 0 10px;"><strong>📌 What type of case is this for?</strong><br>${caseType}</p>
        <p style="margin: 0 0 10px;"><strong>👥 Involved members:</strong><br>${involvedMembers}</p>
        <p style="margin: 0 0 10px;"><strong>📍 Preferred Service Type:</strong><br>${preferredServiceType}</p>
        <p style="margin: 0 0 10px;"><strong>💡 Likelihood of Hiring:</strong><br>${likelihoodOfHiring}</p>
        <p style="margin: 0;"><strong>🕒 Preferred Contact Time:</strong><br>${preferredContactTime}</p>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #f68c1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
          Go to Dashboard
        </a>
      </td>
    </tr>

    <!-- Support Message -->
    <tr>
      <td style="padding: 0 25px 20px; font-size: 15px; color: #555;">
        If you need help setting up your account or understanding how leads work, our support team is here to help.
        <br><br>
        Thank you for joining <strong>${appName}</strong> — we're excited to support your legal journey.
      </td>
    </tr>

    <!-- Signoff -->
    <tr>
      <td style="padding: 0 25px 30px; font-size: 16px; color: #333;">
        Best Regards,<br>
        <strong style="color: #f68c1f;">${appName} Team</strong>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
        <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
        <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
          You are receiving this email because you registered on ${appName} as a legal professional.</p>
        <p style="margin: 0;">
          <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
          <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
          <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
          <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};




export const welcomeLawyerEmail = (data: {
  name: string;
  paracticeArea: string;
  dashboardUrl?: string;
}) => {
  const { name, paracticeArea, dashboardUrl = "https://app.thelawapp.com/dashboard" } = data;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Welcome Lawyer</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; padding: 40px 20px;">
        <!-- Logo -->
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
            </td>
        </tr>

        <!-- Greeting -->
        <tr>
            <td style="font-size: 20px; font-weight: bold; padding-bottom: 15px;">
                Hi ${name},
            </td>
        </tr>

        <!-- Body Content -->
        <tr>
            <td style="font-size: 16px; line-height: 1.6; color: #333;">
                Welcome to <strong>TheLawApp!</strong> We're thrilled to have you join our growing network of legal
                professionals.

                <br /><br />
                You’ve successfully created your account as a <strong>${paracticeArea}</strong>. You can now:
                <ul>
                    <li>Start receiving legal inquiries</li>
                    <li>Review leads and reply directly</li>
                    <li>Build your reputation on the platform</li>
                </ul>

                To get started, visit your dashboard and complete your profile to improve your visibility and trust
                score.
            </td>
        </tr>

        <!-- CTA Button -->
        <tr>
            <td align="center" style="padding: 30px 0;">
                <a href="${dashboardUrl}"
                    style="background-color: #f68c1f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
                    Go to Dashboard
                </a>
            </td>
        </tr>

        <!-- Support Message -->
        <tr>
            <td style="font-size: 15px; color: #555; line-height: 1.5;">
                If you need help setting up your account or understanding how leads work, our support team is here to
                help.
                <br /><br />
                Thank you for joining TheLawApp — we're excited to support your legal journey.
            </td>
        </tr>

        <!-- Signoff -->
        <tr>
            <td style="padding-top: 30px; font-size: 16px;">
                Best Regards, <br />
                <strong style="color: #f68c1f;">TheLawApp Team</strong>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="padding-top: 40px; font-size: 12px; color: #999;">
                <hr style="border: none; height: 1px; background-color: #eee;" />
                <p>
                    © 2025 TheLawApp. All rights reserved.<br />
                    You are receiving this email because you registered on TheLawApp as a legal professional.
                </p>
                <p>
                    <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
                    <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
                    <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
                    <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
