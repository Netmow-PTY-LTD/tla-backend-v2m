import { transporter } from '../config/emailTranspoter';
import config from '../config';

interface ISendEmail {
    to: string;
    subject: string;
    html: string;
}

/**
 * Service to handle core email sending logic
 */
const sendEmail = async ({ to, subject, html }: ISendEmail) => {
    const mailOptions = {
        from: `"TheLawApp" <${config.mailgun_from_email_address || 'noreply@thelawapp.com.au'}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Email send failed:', error);
        throw error;
    }
};

/**
 * Helper to replace dynamic variables in templates
 * Example: "Hello {{name}}" -> "Hello John"
 */
const replaceVariables = (template: string, data: Record<string, any>) => {
    let result = template;
    for (const key in data) {
        const value = data[key];
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
};

export const emailService = {
    sendEmail,
    replaceVariables,
};
