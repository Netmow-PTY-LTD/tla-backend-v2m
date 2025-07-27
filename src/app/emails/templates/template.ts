
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
    
    <!-- Logo -->
    <tr>
      <td align="center" style="padding: 20px 0; background-color: #ffffff;">
        <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" style="display: block;" />
      </td>
    </tr>
    

    <!-- Greeting & Message -->
    
    <tr>
      <td style="padding: 30px; color: #333;">
        <h2 style="margin: 0 0 20px; font-size: 24px; color: #333;">${greeting}</h2>

        <p style="margin: 0 0 15px; font-size: 15px; color: #555;">
          We’re excited to let you know that your profile has officially been recognized as a
          <strong>${role}</strong> on <strong>${appName}</strong>.
        </p>

        <p style="margin: 0 0 10px; font-size: 15px; color: #555;">
          Here’s what you unlock:
        </p>

        <ul style="padding-left: 20px; margin: 0; font-size: 15px; color: #555; list-style: disc;">
          ${features}
        </ul>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding: 30px 0;">
        <a href="${dashboardUrl}" 
          style="background-color: #f68c1f; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
          Go to Dashboard
        </a>
      </td>
    </tr>

    <!-- Support Message -->
    <tr>
      <td style="padding: 0 30px 20px; font-size: 15px; color: #555;">
        If you need help setting up your account or understanding how leads work, our support team is here to help.
        <br><br>
        Thank you for joining <strong>${appName}</strong> — we're excited to support your legal journey.
      </td>
    </tr>

    <!-- Signoff -->
    <tr>
      <td style="padding: 0 30px 30px; font-size: 16px; color: #333;">
        Best Regards, <br>
        <strong style="color: #f68c1f;">${appName} Team</strong>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
        <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
        <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
          You are receiving this email because you registered on ${appName} as a legal professional.
        </p>
        <p style="margin: 0;">
          <a href="https://thelawapp.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> •
          <a href="https://thelawapp.com/terms" style="color: #999; text-decoration: none;">Terms</a> •
          <a href="https://thelawapp.com/help" style="color: #999; text-decoration: none;">Help Center</a> •
          <a href="https://thelawapp.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
        </p>
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




export const passwordResetEmail = (data: {
  name: string;
  resetUrl: string;
}) => {
  const { name, resetUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">     
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #ffffff; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background-color:#ffffff; padding: 20px;">
   
     <!-- Logo -->
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
            </td>
        </tr>

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

    <!-- Social Links -->
    <tr>
      <td style="text-align:center; padding:30px 0;">
        <a href="https://instagram.com/thelawapp"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width:30px; margin:0 10px;"></a>
        <a href="https://facebook.com/thelawapp"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width:30px; margin:0 10px;"></a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 10px 30px; text-align: center; font-size: 12px; color: #888;">
        © 2025 TheLawApp. All rights reserved.
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 30px; text-align: center; font-size: 12px; color: #888; line-height: 1.5;">
        You are receiving this mail because you requested to reset your password at TheLawApp. If you no longer want to receive such emails, click the unsubscribe link below.
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 30px; text-align: center; font-size: 12px; color: #888;">
        <a href="https://thelawapp.com/privacy" style="color: #FF7F27; text-decoration: none;">Privacy policy</a> • 
        <a href="https://thelawapp.com/terms" style="color: #FF7F27; text-decoration: none;">Terms of service</a> • 
        <a href="https://thelawapp.com/help" style="color: #FF7F27; text-decoration: none;">Help center</a> • 
        <a href="https://thelawapp.com/unsubscribe" style="color: #FF7F27; text-decoration: none;">Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};



export const otpEmail = (data: { name: string; otp: string; expiresIn?: string }) => {
  const { name, otp, expiresIn = "5 minutes" } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #ffffff; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background-color:#ffffff;">
    <!-- Logo -->
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
            </td>
        </tr>
    <tr>
      <td style="padding: 0 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Here is your <strong>One Time Password (OTP)</strong>.<br>
          Please enter this code to verify your email address for TheLawApp:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 10px; background-color:#f8f6fc; padding: 12px 20px; border-radius: 6px;">
            ${otp.split("").join("&nbsp;")}
          </div>
        </div>
        <p style="font-size: 14px; color: #555; text-align: center; margin-bottom: 30px;">
          OTP will expire in <strong>${expiresIn}</strong>.
        </p>         
        <p style="font-size: 14px; margin-top: 20px;">
          Best Regards,<br>
          <span style="color:#FF7F27; font-weight: bold;">TheLawApp team</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};



export const leadEmailTemplate = (data: {
  clientName: string;
  lawyerType: string;
  location: string;
  credits: number;
  email: string;
  phone: string;
  description: string;
  projectType: string;
  projectValue: string;
  mapImageUrl?: string;
  contactUrl?: string;
  viewDetailsUrl?: string;
  discountUrl?: string;
}) => {
  const {
    clientName,
    lawyerType,
    location,
    credits,
    email,
    phone,
    description,
    projectType,
    projectValue,
    mapImageUrl = "https://via.placeholder.com/150x100?text=Map",
    contactUrl = "#",
    viewDetailsUrl = "#",
    discountUrl = "#"
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lead Notification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; overflow:hidden;">
    <!-- Header Logo -->
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
            </td>
        </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding:20px;">
        <!-- Title -->
        <h2 style="font-size:18px; margin-bottom:10px;">
          <strong>${clientName}</strong> is looking for a ${lawyerType}
        </h2>

        <!-- Location -->
        <p style="margin:5px 0; font-size:14px; color:#666;">
          <span style="color:red;">📍</span> ${location}
        </p>

        <!-- Credits -->
        <p style="margin:5px 0; font-size:14px; color:#333;">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828961.png" alt="" style="width:14px; vertical-align:middle;"> 
          ${credits} Credits to respond
        </p>

        <!-- Contact Info and Map -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td style="vertical-align:top; width:60%; font-size:14px; line-height:1.6; color:#444;">
              <p style="margin:5px 0;">📧 ${email}</p>
              <p style="margin:5px 0;">📞 ${phone}</p>
              <p style="margin:10px 0;">
                ${description}
              </p>
              <a href="${contactUrl}" style="background-color:#ff7f27; color:#fff; text-decoration:none; padding:8px 15px; border-radius:5px; font-size:14px; display:inline-block;">Contact ${clientName}</a>
            </td>
            <td style="text-align:right; vertical-align:top; width:40%;">
              <img src="${mapImageUrl}" alt="Location Map" style="width:100%; border-radius:5px; margin-bottom:8px;">
              <a href="${viewDetailsUrl}" style="background-color:#fff; border:1px solid #ff7f27; color:#ff7f27; text-decoration:none; padding:6px 12px; border-radius:5px; font-size:14px; display:inline-block;">View Details</a>
            </td>
          </tr>
        </table>

        <!-- Project Details -->
        <h3 style="margin-top:20px; font-size:16px; color:#000;">Project Details</h3>
        <p style="font-size:14px; margin:5px 0;">Which of these best describes you? <strong>${projectType}</strong></p>
        <p style="font-size:14px; margin:5px 0;">What is the approx. value of the contract this is about? <strong>${projectValue}</strong></p>

        <!-- Contact Button -->
        <div style="margin:20px 0;">
          <a href="${contactUrl}" style="background-color:#ff7f27; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px; font-size:16px; display:inline-block;">Contact ${clientName}</a>
        </div>

        <!-- Discount Offer -->
        <div style="text-align:center; padding:20px; border-top:1px solid #eee;">
          <h2 style="font-size:20px; margin:10px 0; color:#000;">Get 20% off</h2>
          <a href="${discountUrl}" style="background-color:#ff7f27; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px; font-size:16px; display:inline-block;">Get 20% off</a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px; text-align:center; font-size:12px; color:#999; background-color:#f5f5f5;">
        <p style="margin:0;">Suit B3, Level 35/4 Jephson ST, Toowong QLD 4068, Australia</p>
        <p style="margin:5px 0;">Don't like these emails? <a href="#" style="color:#ff7f27; text-decoration:none;">Unsubscribe</a>.</p>
        <div style="margin:10px 0;">
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" alt="Facebook" style="width:24px; margin:0 4px;"></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="LinkedIn" style="width:24px; margin:0 4px;"></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384062.png" alt="Twitter" style="width:24px; margin:0 4px;"></a>
        </div>
        <div>
          <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/App_Store_badge.svg" alt="App Store" style="width:100px; margin:0 5px;"></a>
          <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Get_it_on_Google_play.svg" alt="Google Play" style="width:110px; margin:0 5px;"></a>
        </div>
        <p style="margin-top:10px;">Powered by TheLawApp</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

