interface RegistrationEmailOptions {
  name: string;
  email: string;
  defaultPassword: string | undefined;
  loginUILink: string;
  appName?: string;
}

export function generateRegistrationEmail({
  name,
  email,
  defaultPassword,
  loginUILink,
  appName = 'YourAppName',
}: RegistrationEmailOptions) {
  const subject = `Welcome to ${appName} – Your Account is Ready!`;

  const text = `Hi ${name},

Welcome to ${appName}! Your account has been successfully created.

You can now log in using the following credentials:
Email: ${email}
Default Password: ${defaultPassword}

Please log in and change your password as soon as possible for security reasons:
${loginUILink}

If you did not sign up for this account, please contact our support team immediately.`;

  const html = `
    <h1>Welcome to ${appName}!</h1>
    <p>Hello, ${name} 👋</p>
    <p>Your account has been successfully registered.</p>
    <p><strong>Here are your login credentials:</strong></p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Default Password:</strong> ${defaultPassword}</li>
    </ul>
    <p>Please log in and update your password immediately for security reasons.</p>
    <a href="${loginUILink}" style="display:inline-block;padding:10px 15px;background-color:#28a745;color:#fff;text-decoration:none;border-radius:5px;">
      Login to Your Account
    </a>
    <p>If you didn’t sign up, please contact our support immediately.</p>
  `;

  return { subject, text, html };
}
