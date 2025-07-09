
import twilio, { Twilio } from 'twilio';

const defaultTwilioClient: Twilio = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH!);

const defaultFrom = process.env.TWILIO_PHONE!;

interface SendSMSParams {
    to: string;
    message: string;
    from?: string; // Optional override
    client?: Twilio; // Optional for test/mocking
}

export const sendSMS = async ({
    to,
    message,
    from = defaultFrom,
    client = defaultTwilioClient,
}: SendSMSParams) => {
    if (!to || !message) {
        throw new Error('Recipient phone number and message are required');
    }

    if (!from) {
        throw new Error('Missing "from" sender ID for Twilio SMS');
    }

    try {
        const result = await client.messages.create({
            to,
            from,
            body: message,
        });

        return {
            sid: result.sid,
            status: result.status,
            to: result.to,
            body: result.body,
            createdAt: result.dateCreated,
        };
    } catch (error: any) {
        throw new Error(`Twilio SMS send failed: ${error.message}`);
    }
};
