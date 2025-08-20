import config from "../../config";

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
          <a href="${config.client_url}/privacy-policy" style="color: #999;">Privacy Policy</a> •
          <a href="${config.client_url}/terms" style="color: #999;">Terms</a> •
          <a href="${config.client_url}/trust-and-quality" style="color: #999;">Trust and Quality</a> •
          <a href="${config.client_url}/faq" style="color: #999;">FAQs</a>
          <a href="${config.client_url}/disclaimer" style="color: #999;">Disclaimer</a>
        </p>
      </td>
    </tr>
    </table>
</body>
</html>`



// export const congratulationsLawyerPromotion = (data: {
//   name: string;
//   role: 'Expert Lawyer' | 'Premium Lawyer' | 'Verified Lawyer';
//   dashboardUrl: string;
//   appName: string;
// }) => {
//   const { name, role, dashboardUrl, appName } = data;

//   let greeting = '';
//   let features = '';

//   if (role === 'Expert Lawyer') {
//     greeting = `Welcome to the Expert Lawyer Circle, ${name}!`;
//     features = `
//       <li>Priority listing in search results</li>
//       <li>Verified badge on your profile</li>
//       <li>Access to premium client leads</li>`;
//   } else if (role === 'Premium Lawyer') {
//     greeting = `You've been upgraded to Premium Lawyer status, ${name}!`;
//     features = `
//       <li>Exclusive access to premium clients</li>
//       <li>Profile promotion across the platform</li>
//       <li>Faster client match algorithm</li>`;
//   } else if (role === 'Verified Lawyer') {
//     greeting = `Congratulations, ${name}! You're now a Verified Lawyer!`;
//     features = `
//       <li>Official verification badge for trust and credibility</li>
//       <li>Higher visibility across client searches</li>
//       <li>Access to verified-only leads and opportunities</li>`;
//   }

//   return `
//  <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Congratulations Email</title>
//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; line-height: 1.6;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">

//     <!-- Logo -->
//     <tr>
//       <td align="center" style="padding: 20px 0; background-color: #ffffff;">
//         <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" style="display: block;" />
//       </td>
//     </tr>


//     <!-- Greeting & Message -->

//     <tr>
//       <td style="padding: 30px; color: #333;">
//         <h2 style="margin: 0 0 20px; font-size: 24px; color: #333;">${greeting}</h2>

//         <p style="margin: 0 0 15px; font-size: 15px; color: #555;">
//           We’re excited to let you know that your profile has officially been recognized as a
//           <strong>${role}</strong> on <strong>${appName}</strong>.
//         </p>

//         <p style="margin: 0 0 10px; font-size: 15px; color: #555;">
//           Here’s what you unlock:
//         </p>

//         <ul style="padding-left: 20px; margin: 0; font-size: 15px; color: #555; list-style: disc;">
//           ${features}
//         </ul>
//       </td>
//     </tr>

//     <!-- CTA Button -->
//     <tr>
//       <td align="center" style="padding: 30px 0;">
//         <a href="${dashboardUrl}" 
//           style="background-color: #f68c1f; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
//           Go to Dashboard
//         </a>
//       </td>
//     </tr>

//     <!-- Support Message -->
//     <tr>
//       <td style="padding: 0 30px 20px; font-size: 15px; color: #555;">
//         If you need help setting up your account or understanding how leads work, our support team is here to help.
//         <br><br>
//         Thank you for joining <strong>${appName}</strong> — we're excited to support your legal journey.
//       </td>
//     </tr>

//     <!-- Signoff -->
//     <tr>
//       <td style="padding: 0 30px 30px; font-size: 16px; color: #333;">
//         Best Regards, <br>
//         <strong style="color: #f68c1f;">${appName} Team</strong>
//       </td>
//     </tr>

//     <!-- Footer -->
//     <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
//           You are receiving this email because you registered on ${appName} as a legal professional.
//         </p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999; text-decoration: none;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999; text-decoration: none;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>

//   </table>
// </body>
// </html>
//   `;
// };



//  ------------------------- New Lead Alert ---------------------------------------

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
  ${headerDesign}

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

 ${footerDesign}
  `;
};



//  ------------------------- New Lead Alert ---------------------------------------


export const newLeadAlertToLawyer = (data: {
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


// ------------------------------------  Clinet or Lead create or submission ----------------------------------------------------
// export const welcomeLeadSubmitted = (data: {
//   name: string;
//   caseType: string;
//   leadAnswer: string;
//   preferredContactTime: string;
//   additionalDetails: string;
//   dashboardUrl: string;
//   appName: string;
//   email?: string;
// }) => {
//   const {
//     name,
//     caseType,
//     leadAnswer,
//     preferredContactTime,
//     additionalDetails,
//     dashboardUrl,
//     appName,
//     email = 'support@yourdomain.com',
//   } = data;

//   return `

//   <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Welcome - Lead Submitted</title>
//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 8px;
//       font-size: 15px;
//       color: #111;
//     }
//     span.im {
//        color: #555 !important;
//       }
//   </style>
// </head>
// <body>
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">

//     <!-- Logo -->
//     <tr>
//       <td align="center" style="padding: 20px 0; background: #ffffff;">
//         <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="${appName} Logo" width="190" style="display: block;" />
//       </td>
//     </tr>

//     <!-- Greeting -->
//     <tr>
//       <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
//         Hi ${name},
//       </td>
//     </tr>

//     <!-- Intro Message -->
//     <tr>
//       <td style="padding: 0 25px 20px; font-size: 15px; color: #555;">
//         We're reviewing your case details and matching you with the right lawyer. You’ll be contacted shortly by a qualified legal professional.
//       </td>
//     </tr>

//     <!-- Case Summary (Lead Answer included here) -->
//     <tr>
//       <td style="padding: 0 25px 25px;">
//         <h3>📝 Case Summary</h3>
//         ${leadAnswer}
//         <p><strong>What type of case is this for?</strong><br>${caseType}</p>
//         <p><strong>When are you looking to get started?</strong><br>${preferredContactTime}</p>
//         <p>
//         <strong>📝 Additional Details:</strong><br>
//             ${additionalDetails || 'No additional details were provided for this lead.'}
//         </p>
//       </td>
//     </tr>

//     <!-- CTA Button -->
//     <tr>
//       <td align="center" style="padding: 30px 0;">
//         <a href="${dashboardUrl}" style="background-color: #f68c1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
//           Go to Dashboard
//         </a>
//       </td>
//     </tr>

//     <!-- Support Message -->
//     <tr>
//       <td style="padding: 0 25px 20px; font-size: 15px; color: #555;">
//         If you need help setting up your account or understanding how leads work, our support team is here to help.
//         <br><br>
//         Thank you for joining <strong>${appName}</strong> — we're excited to support your legal journey.
//       </td>
//     </tr>

//     <!-- Sign-off -->
//     <tr>
//       <td style="padding: 0 25px 30px; font-size: 16px; color: #333;">
//         Best Regards,<br>
//         <strong style="color: #f68c1f;">${appName} Team</strong>
//       </td>
//     </tr>

//     <!-- Footer -->
//     <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
//           You are receiving this email because you registered on ${appName} as a legal professional.</p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//   `;
// };

export const welcomeLeadSubmitted = (data: {
  name: string;
  caseType: string;
  leadAnswer: string;
  preferredContactTime: string;
  additionalDetails: string;
  dashboardUrl: string;
  appName: string;
  email?: string;
}) => {
  const {
    name,
    caseType,
    leadAnswer,
    preferredContactTime,
    additionalDetails,
    dashboardUrl,
    appName,
    // email = 'support@yourdomain.com',
  } = data;

  return `
  
 ${headerDesign}

    <!-- Greeting -->
    <tr>
      <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
        Hi ${name},
      </td>
    </tr>

    <!-- Intro Message -->
    <tr>
      <td style="padding: 0 25px 20px; font-size: 15px; color: #555;">
        We're reviewing your case details and matching you with the right lawyer. You’ll be contacted shortly by a qualified legal professional.
      </td>
    </tr>

    <!-- Case Summary (Lead Answer included here) -->
    <tr>
      <td style="padding: 0 25px 25px;">
        <h3>📝 Case Summary</h3>
        ${leadAnswer}
        <p><strong>What type of case is this for?</strong><br>${caseType}</p>
        <p><strong>When are you looking to get started?</strong><br>${preferredContactTime}</p>
        <p>
        <strong>📝 Additional Details:</strong><br>
            ${additionalDetails || 'No additional details were provided for this lead.'}
        </p>
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

    <!-- Sign-off -->
    <tr>
      <td style="padding: 0 25px 30px; font-size: 16px; color: #333;">
        Best Regards,<br>
        <strong style="color: #f68c1f;">${appName} Team</strong>
      </td>
    </tr>
${footerDesign}
  `;
};


//  -------------------------- Welcome Lawyer For Registration ---------------------------

// export const welcomeLawyerEmail = (data: {
//   name: string;
//   paracticeArea: string;
//   dashboardUrl?: string;
// }) => {
//   const { name, paracticeArea, dashboardUrl = "https://app.thelawapp.com/dashboard" } = data;
//   const appName = 'TheLawApp';
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8" />
//     <title>Welcome Lawyer</title>
//  <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 8px;
//       font-size: 15px;
//       color: #111;
//     }
//     span.im {
//        color: #555 !important;
//       }
//   </style>
// </head>
// <body>
//     <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; ">
//         <!-- Logo -->
//         <tr>
//             <td align="center" style="padding: 20px 0;">
//                 <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
//             </td>
//         </tr>

//         <!-- Greeting -->
//         <tr>
//             <td style="font-size: 20px; font-weight: bold; padding: 10px 20px;">
//                 Hi ${name},
//             </td>
//         </tr>

//         <!-- Body Content -->
//         <tr>
//             <td style="font-size: 16px; padding: 0 20px; line-height: 1.6; color: #333;">
//                 Welcome to <strong>TheLawApp!</strong> We're thrilled to have you join our growing network of legal
//                 professionals.

//                 <br /><br />
//                 You’ve successfully created your account as a <strong>${paracticeArea}</strong>. You can now:
//                 <ul>
//                     <li>Start receiving legal inquiries</li>
//                     <li>Review leads and reply directly</li>
//                     <li>Build your reputation on the platform</li>
//                 </ul>

//                 To get started, visit your dashboard and complete your profile to improve your visibility and trust
//                 score.
//             </td>
//         </tr>

//         <!-- CTA Button -->
//         <tr>
//             <td align="center" style="padding: 30px 20px;">
//                 <a href="${dashboardUrl}"
//                     style="background-color: #f68c1f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
//                     Go to Dashboard
//                 </a>
//             </td>
//         </tr>

//         <!-- Support Message -->
//         <tr>
//             <td style="font-size: 15px; color: #555; line-height: 1.5;padding: 0 20px ;">
//                 If you need help setting up your account or understanding how leads work, our support team is here to
//                 help.
//                 <br /><br />
//                 Thank you for joining TheLawApp — we're excited to support your legal journey.
//             </td>
//         </tr>

//         <!-- Signoff -->
//         <tr>
//             <td style="padding-top: 30px; font-size: 16px; padding:0 20px">
//                 Best Regards, <br />
//                 <strong style="color: #f68c1f;">TheLawApp Team</strong>
//             </td>
//         </tr>

//         <!-- Footer -->
//         <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
//             You are receiving this email because you registered on TheLawApp as a legal professional.</p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//     </table>
// </body>
// </html>
// `

// };


export const welcomeLawyerEmail = (data: {
  name: string;
  paracticeArea: string;
  dashboardUrl?: string;
}) => {
  const { name, paracticeArea, dashboardUrl = "https://app.thelawapp.com/dashboard" } = data;
  const appName = 'TheLawApp';
  return `
${headerDesign}
        <!-- Greeting -->
        <tr>
            <td style="font-size: 20px; font-weight: bold; padding: 10px 20px;">
                Hi ${name},
            </td>
        </tr>

        <!-- Body Content -->
        <tr>
            <td style="font-size: 16px; padding: 0 20px; line-height: 1.6; color: #333;">
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
            <td align="center" style="padding: 30px 20px;">
                <a href="${dashboardUrl}"
                    style="background-color: #f68c1f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
                    Go to Dashboard
                </a>
            </td>
        </tr>

        <!-- Support Message -->
        <tr>
            <td style="font-size: 15px; color: #555; line-height: 1.5;padding: 0 20px ;">
                If you need help setting up your account or understanding how leads work, our support team is here to
                help.
                <br /><br />
                Thank you for joining TheLawApp — we're excited to support your legal journey.
            </td>
        </tr>

        <!-- Signoff -->
        <tr>
            <td style="padding-top: 30px; font-size: 16px; padding:0 20px">
                Best Regards, <br />
                <strong style="color: #f68c1f;">TheLawApp Team</strong>
            </td>
        </tr>

      ${footerDesign}
`

};


//  -------------------------- Welcome client For Registration ---------------------------

// export const welcomeClientEmail = (data: {
//   name: string;
//   email: string;
//   defaultPassword: string;
//   dashboardUrl?: string;
// }) => {
//   const { name, email, defaultPassword, dashboardUrl = "https://app.thelawapp.com/dashboard" } = data;
//   const appName = 'TheLawApp';
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8" />
//     <title>Welcome Client</title>
//     <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body>
//     <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; ">
//         <!-- Logo -->
//         <tr>
//             <td align="center" style="padding: 20px 0;">
//                 <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
//             </td>
//         </tr>

//         <!-- Greeting -->
//         <tr>
//             <td style="font-size: 20px; font-weight: bold; padding:0 20px 15px 20px;">
//                 Hi ${name},
//             </td>
//         </tr>

//         <!-- Body Content -->
//         <tr>
//             <td style="font-size: 16px; line-height: 1.6; color: #333; padding: 0 20px;">
//                 Welcome to <strong>TheLawApp!</strong> We're excited to have you onboard.
//                 <br /><br />
//                 Your account has been successfully created. You can now:
//                 <ul>
//                     <li>Search for legal services tailored to your needs</li>
//                     <li>Send inquiries and receive offers from verified lawyers</li>
//                     <li>Track your legal requests in one convenient place</li>
//                 </ul>

//                 Here are your login details:
//                 <br />
//                 <strong>Email:</strong> ${email}<br />
//                 <strong>Password:</strong> ${defaultPassword}

//                 <br /><br />
//                 For security, we recommend updating your password after your first login.
//             </td>
//         </tr>

//         <!-- CTA Button -->
//         <tr>
//             <td align="center" style="padding: 30px ;">
//                 <a href="${dashboardUrl}"
//                     style="background-color: #f68c1f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
//                     Go to Dashboard
//                 </a>
//             </td>
//         </tr>

//         <!-- Support Message -->
//         <tr>
//             <td style="font-size: 15px; color: #555; line-height: 1.5; padding: 0 20px;">
//                 If you need assistance or have any questions, our support team is here to help.
//                 <br /><br />
//                 Thank you for choosing TheLawApp — we’re here to simplify your legal journey.
//             </td>
//         </tr>

//         <!-- Signoff -->
//         <tr>
//             <td style="padding: 30px 20px;; font-size: 16px;">
//                 Best Regards, <br />
//                 <strong style="color: #f68c1f;">TheLawApp Team</strong>
//             </td>
//         </tr>

//         <!-- Footer -->
//         <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}. © 2025 TheLawApp. All rights reserved.<br />
//                     You are receiving this email because you registered on TheLawApp as a client.</p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//     </table>
// </body>
// </html>
// `
// };
export const welcomeClientEmail = (data: {
  name: string;
  email: string;
  defaultPassword: string;
  dashboardUrl?: string;
}) => {
  const { name, email, defaultPassword, dashboardUrl = "https://app.thelawapp.com/dashboard" } = data;
  // const appName = 'TheLawApp';
  return `
${headerDesign}

        <!-- Greeting -->
        <tr>
            <td style="font-size: 20px; font-weight: bold; padding:0 20px 15px 20px;">
                Hi ${name},
            </td>
        </tr>

        <!-- Body Content -->
        <tr>
            <td style="font-size: 16px; line-height: 1.6; color: #333; padding: 0 20px;">
                Welcome to <strong>TheLawApp!</strong> We're excited to have you onboard.
                <br /><br />
                Your account has been successfully created. You can now:
                <ul>
                    <li>Search for legal services tailored to your needs</li>
                    <li>Send inquiries and receive offers from verified lawyers</li>
                    <li>Track your legal requests in one convenient place</li>
                </ul>

                Here are your login details:
                <br />
                <strong>Email:</strong> ${email}<br />
                <strong>Password:</strong> ${defaultPassword}

                <br /><br />
                For security, we recommend updating your password after your first login.
            </td>
        </tr>

        <!-- CTA Button -->
        <tr>
            <td align="center" style="padding: 30px ;">
                <a href="${dashboardUrl}"
                    style="background-color: #f68c1f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
                    Go to Dashboard
                </a>
            </td>
        </tr>

        <!-- Support Message -->
        <tr>
            <td style="font-size: 15px; color: #555; line-height: 1.5; padding: 0 20px;">
                If you need assistance or have any questions, our support team is here to help.
                <br /><br />
                Thank you for choosing TheLawApp — we’re here to simplify your legal journey.
            </td>
        </tr>

        <!-- Signoff -->
        <tr>
            <td style="padding: 30px 20px;; font-size: 16px;">
                Best Regards, <br />
                <strong style="color: #f68c1f;">TheLawApp Team</strong>
            </td>
        </tr>

       ${footerDesign}
`
};



//   ------------------------ Public and client Lawyer intraction  -----------------------------------------



// export const interactionEmail = (data: {
//   name: string;
//   userRole: string;
//   dashboardUrl: string;
//   senderName: string;
//   timestamp: string;
//   message: string;
// }) => {
//   const { name, userRole, dashboardUrl, message, timestamp, senderName } = data;
//   const appName = 'TheLawApp';

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Email Interaction</title>
//    <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;  color: #333;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">

//     <!-- Logo -->
//     <tr>
//       <td align="center" style="padding: 20px 0; background: #ffffff;">
//         <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="${appName} Logo" width="190" style="display: block;" />
//       </td>
//     </tr>

//      <tr>
//       <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
//         Hello ${name},
//       </td>
//     </tr>

//     <!-- Message Section -->
//     <tr>
//       <td style="padding: 0 25px;">
//         <p style="font-size: 16px; color: #555; margin: 20px 0 10px;">
//           You’ve received a new message through <strong>${appName}</strong>. Here’s a quick preview:
//         </p>

//         <table width="100%" cellpadding="0" cellspacing="0" style="; border-radius: 6px; padding: 15px;">
//           <tr>
//             <td style="font-size: 16px; color: #888; padding-bottom: 6px;">
//               <strong>${senderName}</strong> • ${timestamp}
//             </td>
//           </tr>
//           <tr>
//             <td style="font-size: 15px; color: #555; line-height: 1.6;">
//               "${message}"
//             </td>
//           </tr>
//         </table>
//       </td>
//     </tr>

//     <!-- Button -->
//     <tr>
//       <td align="center" style="padding: 30px 0;">
//         <a href="${dashboardUrl}" style="background-color: #f68c1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block; text-decoration: none;">
//           View Full Conversation
//         </a>
//       </td>
//     </tr>

//     <!-- Support Info -->
//     <tr>
//       <td style="padding: 0 25px 20px; font-size: 15px; color: #555; line-height: 1.6;">
//         Need help or have questions? Our support team is here to assist you anytime.
//         <br><br>
//         Thank you for using <strong>${appName}</strong> to stay connected.
//       </td>
//     </tr>

//     <!-- Sign-off -->
//     <tr>
//       <td style="padding: 0 25px 30px; font-size: 16px; color: #333;">
//         Warm regards,<br>
//         <strong style="color: #f68c1f;">The ${appName} Team</strong>
//       </td>
//     </tr>


//     <!-- Footer -->
//     <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">
//           © 2025 ${appName}. All rights reserved.<br>
//           You are receiving this email because you're a registered ${userRole} on ${appName}.
//         </p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;
// };
export const interactionEmail = (data: {
  name: string;
  userRole: string;
  dashboardUrl: string;
  senderName: string;
  timestamp: string;
  message: string;
}) => {
  const { name, userRole, dashboardUrl, message, timestamp, senderName } = data;
  const appName = 'TheLawApp';

  return `
${headerDesign}
     <tr>
      <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
        Hello ${name},
      </td>
    </tr>

    <!-- Message Section -->
    <tr>
      <td style="padding: 0 25px;">
        <p style="font-size: 16px; color: #555; margin: 20px 0 10px;">
          You’ve received a new message through <strong>${appName}</strong>. Here’s a quick preview:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="; border-radius: 6px; padding: 15px;">
          <tr>
            <td style="font-size: 16px; color: #888; padding-bottom: 6px;">
              <strong>${senderName}</strong> • ${timestamp}
            </td>
          </tr>
          <tr>
            <td style="font-size: 15px; color: #555; line-height: 1.6;">
              "${message}"
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Button -->
    <tr>
      <td align="center" style="padding: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #f68c1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block; text-decoration: none;">
          View Full Conversation
        </a>
      </td>
    </tr>

    <!-- Support Info -->
    <tr>
      <td style="padding: 0 25px 20px; font-size: 15px; color: #555; line-height: 1.6;">
        Need help or have questions? Our support team is here to assist you anytime.
        <br><br>
        Thank you for using <strong>${appName}</strong> to stay connected.
      </td>
    </tr>

    <!-- Sign-off -->
    <tr>
      <td style="padding: 0 25px 30px; font-size: 16px; color: #333;">
        Warm regards,<br>
        <strong style="color: #f68c1f;">${appName} Team</strong>
      </td>
    </tr>


    ${footerDesign}
`;
};






// export const publicContactEmail = (data: {
//   name: string;
//   email: string;
//   phone?: string;
//   message: string;
// }) => {
//   const { name, email, phone, message } = data;
//   const appName = 'TheLawApp';

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>New Contact Request</title>
//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body style="margin: 0; padding: 5%; font-family: Arial, sans-serif;  color: #333;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">

//     <!-- Logo -->
//     <tr>
//       <td align="center" style="padding: 20px 0; background: #ffffff;">
//         <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="${appName} Logo" width="190" style="display: block;" />
//       </td>
//     </tr>

//     <!-- Heading -->
//     <tr>
//       <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
//         New Contact Request
//       </td>
//     </tr>

//     <!-- Details -->
//     <tr>
//       <td style="padding: 0 25px;">
//         <table width="100%" cellpadding="0" cellspacing="0" ">
//           <tr>
//             <td style="font-size: 15px; color: #333;"><strong>Name:</strong></td>
//             <td style="font-size: 15px; color: #555;">${name}</td>
//           </tr>
//           <tr>
//             <td style="font-size: 15px; color: #333;"><strong>Email:</strong></td>
//             <td style="font-size: 15px; color: #555;">${email}</td>
//           </tr>
//           ${phone ? `
//           <tr>
//             <td style="font-size: 15px; color: #333;"><strong>Phone:</strong></td>
//             <td style="font-size: 15px; color: #555;">${phone}</td>
//           </tr>` : ''}
//           <tr>
//             <td colspan="2" style="padding-top: 15px; font-size: 15px; color: #333;"><strong>Message:</strong></td>
//           </tr>
//           <tr>
//             <td colspan="2" style="font-size: 15px; color: #555;">${message}</td>
//           </tr>
//         </table>
//       </td>
//     </tr>

//     <!-- Footer -->
//     <tr>
//       <td style="padding: 30px 25px; font-size: 14px; color: #555;">
//         This message was submitted through the public contact form on <strong>${appName}</strong>.
//       </td>
//     </tr>

//     <!-- Footer -->
//        <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//        <p>
//                     © 2025 TheLawApp. All rights reserved.<br />
//                     You are receiving this email because you registered on TheLawApp
//                 </p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999; text-decoration: none;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999; text-decoration: none;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;
// };


export const publicContactEmail = (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) => {
  const { name, email, phone, message } = data;
  // const appName = 'TheLawApp';

  return `
${headerDesign}

    <!-- Heading -->
    <tr>
      <td style="padding: 20px 25px 10px; font-size: 20px; font-weight: bold; color: #333;">
        New Contact Request
      </td>
    </tr>

    <!-- Details -->
    <tr>
      <td style="padding: 0 25px;">
        <table width="100%" cellpadding="0" cellspacing="0" ">
          <tr>
            <td style="font-size: 15px; color: #333;"><strong>Name:</strong></td>
            <td style="font-size: 15px; color: #555;">${name}</td>
          </tr>
          <tr>
            <td style="font-size: 15px; color: #333;"><strong>Email:</strong></td>
            <td style="font-size: 15px; color: #555;">${email}</td>
          </tr>
          ${phone ? `
          <tr>
            <td style="font-size: 15px; color: #333;"><strong>Phone:</strong></td>
            <td style="font-size: 15px; color: #555;">${phone}</td>
          </tr>` : ''}
          <tr>
            <td colspan="2" style="padding-top: 15px; font-size: 15px; color: #333;"><strong>Message:</strong></td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 15px; color: #555;">${message}</td>
          </tr>
        </table>
      </td>
    </tr>

    ${footerDesign}
`;
};



//  ---------------- Authentication Related Email Template --------------------------------------




// export const emailVerificationTemplate = (data: {
//   name: string;
//   verifyUrl: string;
//   role: string;
// }) => {
//   const { name, verifyUrl, role } = data;
//   const appName = 'TheLawApp';
//   return `
// <!DOCTYPE html>
// <html lang="en">     
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Email Verification</title>
//    <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #ffffff; color:#333;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:30px auto; background-color:#ffffff;  border: 1px solid #e0e0e0; border-radius: 6px;">

//     <!-- Logo -->
//     <tr>
//       <td align="center" style="padding: 20px;">
//         <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
//       </td>
//     </tr>

//     <!-- Greeting -->
//     <tr>
//       <td style="padding: 0 30px;">
//         <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
//         <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
//           Thank you for registering with <strong>TheLawApp</strong>. Please verify your email address to activate your account and access your ${role} dashboard.
//         </p>

//         <!-- Verify Button -->
//         <div style="text-align: center; margin-bottom: 30px;">
//           <a href="${verifyUrl}" style="background-color:#FF7F27; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
//             Verify Email
//           </a>
//         </div>

//         <p style="font-size: 14px; color: #555;">
//           If you did not create this account, you can safely ignore this email.
//         </p>

//         <p style="font-size: 14px; margin-top: 20px;">
//           Best Regards,<br>
//           <span style="color:#FF7F27; font-weight: bold;">TheLawApp Team</span>
//         </p>
//       </td>
//     </tr>



//      <!-- Footer -->
//         <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}.  © 2025 TheLawApp. All rights reserved.<br />
//                            You are receiving this mail because you signed up at TheLawApp. If this wasn't you, feel free to ignore this message.
//         </p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999; text-decoration: none;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999; text-decoration: none;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//   `;
// };

export const emailVerificationTemplate = (data: {
  name: string;
  verifyUrl: string;
  role: string;
}) => {
  const { name, verifyUrl, role } = data;
  // const appName = 'TheLawApp';
  return `
  ${headerDesign}

    <!-- Greeting -->
    <tr>
      <td style="padding: 0 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          Thank you for registering with <strong>TheLawApp</strong>. Please verify your email address to activate your account and access your ${role} dashboard.
        </p>

        <!-- Verify Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verifyUrl}" style="background-color:#FF7F27; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
            Verify Email
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          If you did not create this account, you can safely ignore this email.
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




// export const passwordResetEmail = (data: {
//   name: string;
//   resetUrl: string;
// }) => {
//   const { name, resetUrl } = data;
//   const appName = 'TheLawApp';
//   return `
// <!DOCTYPE html>
// <html lang="en">     
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Password Reset</title>
//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Arial, sans-serif;
//       // background-color: #f4f4f4;
//       color: #333;
//       line-height: 1.6;
//     }
//     a {
//       text-decoration: none;
//     }
//     h3 {
//       margin: 20px 0 10px;
//       font-size: 18px;
//       color: #333;
//       border-bottom: 1px solid #ddd;
//       padding-bottom: 5px;
//     }
//     p {
//       margin: 0 0 10px;
//       font-size: 15px;
//       color: #555;
//     }
//   </style>
// </head>
// <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #ffffff; color:#333;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:30px auto; background-color:#ffffff; border: 1px solid #e0e0e0; border-radius: 6px;">

//      <!-- Logo -->
//         <tr>
//             <td align="center" style="padding: 20px;">
//                 <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
//             </td>
//         </tr>

//     <!-- Greeting -->
//     <tr>
//       <td style="padding: 0 30px;">
//         <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
//         <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
//           You have requested us to send a link to reset your password for your TheLawApp account. Click on the button below to proceed.
//         </p>
//         <!-- Button -->
//         <div style="text-align: center; margin-bottom: 30px;">
//           <a href="${resetUrl}" style="background-color:#FF7F27; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:5px; font-size:16px; display:inline-block;">
//             Reset password
//           </a>
//         </div>
//         <p style="font-size: 14px; color: #555;">
//           If you didn’t initiate this request, you can safely ignore this email.
//         </p>
//         <p style="font-size: 14px; margin-top: 20px;">
//           Best Regards,<br>
//           <span style="color:#FF7F27; font-weight: bold;">TheLawApp Team</span>
//         </p>
//       </td>
//     </tr>

//     <!-- Footer -->
//         <tr>
//       <td align="center" style="padding: 30px 20px; font-size: 12px; color: #999; background-color: #f9f9f9;">
//         <hr style="border: none; height: 1px; background-color: #eee; margin-bottom: 15px;" />
//         <p style="margin: 0 0 10px;">© 2025 ${appName}. All rights reserved.<br>
//           You are receiving this mail because you requested to reset your password at TheLawApp. If you no longer want to receive such emails, click the unsubscribe link below. 
//         </p>
//         <p style="margin: 0;">
//           <a href="https://thelawapp.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a> •
//           <a href="https://thelawapp.com/terms" style="color: #999; text-decoration: none;">Terms</a> •
//           <a href="https://thelawapp.com/help" style="color: #999; text-decoration: none;">Help Center</a> •
//           <a href="https://thelawapp.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//   `;
// };

export const passwordResetEmail = (data: {
  name: string;
  resetUrl: string;
}) => {
  const { name, resetUrl } = data;
  // const appName = 'TheLawApp';
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



// export const otpEmail = (data: { username: string; otp: string; expiresAt?: string }) => {
//   const { username = 'users', otp, expiresAt = "3 minutes" } = data;


//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Email Verification</title>
// </head>
// <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #ffffff; color:#333;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background-color:#ffffff;">
//     <!-- Logo -->
//         <tr>
//             <td align="center" style="padding-bottom: 20px;">
//                 <img src="https://thelawapp.syd1.digitaloceanspaces.com/profiles/logo.png" alt="Logo" width="190" />
//             </td>
//         </tr>
//     <tr>
//       <td style="padding: 0 30px;">
//         <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${username},</h2>
//         <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
//           Here is your <strong>One Time Password (OTP)</strong>.<br>
//           Please enter this code to verify your email address for TheLawApp:
//         </p>
//         <div style="text-align: center; margin: 30px 0;">
//           <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 10px; background-color:#f8f6fc; padding: 12px 20px; border-radius: 6px;">
//             ${otp.split("").join("&nbsp;")}
//           </div>
//         </div>
//         <p style="font-size: 14px; color: #555; text-align: center; margin-bottom: 30px;">
//           OTP will expire in <strong>${expiresAt}</strong>.
//         </p>         
//         <p style="font-size: 14px; margin-top: 20px;">
//           Best Regards,<br>
//           <span style="color:#FF7F27; font-weight: bold;">TheLawApp team</span>
//         </p>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//   `;
// };




export const otpEmail = (data: { username: string; otp: string; expiresAt?: string }) => {
  const { username = 'users', otp, expiresAt = "3 minutes" } = data;


  return `
${headerDesign}
    <tr>
      <td style="padding: 0 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">Hi ${username},</h2>
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
          OTP will expire in <strong>${expiresAt}</strong>.
        </p>         
      </td>
    </tr>

     ${footerDesign}
  `;
};



