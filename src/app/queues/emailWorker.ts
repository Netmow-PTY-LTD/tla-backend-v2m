/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { EmailQueue } from './emailQueue.model';
import { User } from '../module/Auth/auth.model';
import { IUserProfile } from '../module/User/user.interface';
import { sendEmail } from '../emails/email.sender';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { EMAIL_QUEUE_NAME } from './email.queue';
import { EMAIL_TEMPLATE_KEYS } from '../module/emailTemplateSystem/emailTemplate.constant';
import { ClientRegistrationDraft } from '../module/Auth/clientRegistrationDraft.model';
import { LawyerRegistrationDraft } from '../module/Auth/LawyerRegistrationDraft.model';
// import { getAppSettings } from '../module/Settings/settingsConfig';

/**
 * Core handler to process a single email job
 */
export const handleEmailJob = async (data: any, jobId?: string) => {
    const { mongoJobId, userId, email, templateKey, data: extraData } = data;

    try {
        // eslint-disable-next-line no-console
        console.log(`🚀 Processing BullMQ job ${jobId} for email: ${email}`);

        // 1. Deduplication guard — skip if this email was already sent
        if (mongoJobId) {
            const existingRecord = await EmailQueue.findById(mongoJobId);
            if (existingRecord?.status === 'sent') {
                // eslint-disable-next-line no-console
                console.warn(
                    `⚠️ Skipping job ${jobId}: email "${templateKey}" already sent to user ${userId}. (EmailQueue status: sent)`
                );
                return;
            }
        }

        // 2. Broad Deduplication guard — skip if this template was EVER sent successfully to this user
        const alreadySent = await EmailQueue.findOne({
            userId,
            templateKey,
            status: 'sent'
        });

        if (alreadySent) {
            console.warn(`⚠️ Skipping: email "${templateKey}" already successfully sent to user ${userId} in a previous record.`);
            if (mongoJobId) {
                await EmailQueue.findByIdAndUpdate(mongoJobId, { status: 'sent' });
            }
            return;
        }

        // 3. Fetch User or Draft and check status
        let name = 'User';
        let shouldSend = true;

        if (templateKey === EMAIL_TEMPLATE_KEYS.CLIENT_DELAYED_ACTIVATION) {
            const draft = await ClientRegistrationDraft.findById(userId);
            if (!draft) {
                shouldSend = false;
                console.warn(`Skipping job ${jobId}: Client draft not found.`);
            } else {
                name = draft.leadDetails?.name || 'User';
            }
        } else if (templateKey === EMAIL_TEMPLATE_KEYS.LAWYER_DELAYED_ACTIVATION) {
            const draft = await LawyerRegistrationDraft.findById(userId);
            if (!draft) {
                shouldSend = false;
                console.warn(`Skipping job ${jobId}: Lawyer draft not found.`);
            } else {
                name = draft.profile?.name || 'User';
            }
        } else {
            const user = await User.findById(userId).populate('profile');

            // ALLOW BOTH APPROVED AND PENDING users to receive automated drip emails
            const isValidStatus = user && [USER_STATUS.APPROVED, USER_STATUS.PENDING].includes(user.accountStatus as any);

            if (!user || !isValidStatus) {
                shouldSend = false;
                const reason = !user ? 'User not found' : `User status is ${user.accountStatus}`;
                console.warn(`Skipping job ${jobId}: ${reason}.`);
            } else {
                const profileInfo = user.profile as IUserProfile;
                name = profileInfo?.name || 'User';
            }
        }

        if (!shouldSend) {
            if (mongoJobId) {
                await EmailQueue.findByIdAndUpdate(mongoJobId, {
                    status: 'failed',
                });
            }
            return;
        }

        // 3. Prepare data for variables
        const variableData = {
            name,
            email,
            to: email,
            ...(extraData || {}),
        };

        // 4. Send email using the unified sendEmail service
        await sendEmail({
            to: email,
            subject: '', // Service will fetch subject from template based on key
            data: variableData,
            emailTemplate: templateKey,
        });

        // 5. Update MongoDB record if it exists
        if (mongoJobId) {
            await EmailQueue.findByIdAndUpdate(mongoJobId, {
                status: 'sent',
                sentAt: new Date(),
            });
        }

        // eslint-disable-next-line no-console
        console.log(`✅ Email sent successfully for job ${jobId}`);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error in BullMQ task handler for job ${jobId}:`, error);

        if (mongoJobId) {
            await EmailQueue.findByIdAndUpdate(mongoJobId, {
                status: 'failed',
                $inc: { retryCount: 1 },
            });
        }

        // Throwing error allows BullMQ to handle retries based on queue config
        throw error;
    }
};

/**
 * Worker to process email jobs from BullMQ
 */
export const startEmailWorker = async () => {
    // const settings = await getAppSettings() as any;
    // const emailSettings = settings?.emailSettings;

    const worker = new Worker(
        EMAIL_QUEUE_NAME,
        async (job: Job) => {
            await handleEmailJob(job.data, job.id);
        },
        {
            connection: redisConnection,
            // concurrency: emailSettings?.workerConcurrency || 5, // Process configured emails at a time
            concurrency: 5, // Process configured emails at a time
        }
    );

    worker.on('completed', job => {
        // eslint-disable-next-line no-console
        console.log(`✅ Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        // eslint-disable-next-line no-console
        console.error(`❌ Job ${job?.id} failed with ${err.message}`);
    });

    // eslint-disable-next-line no-console
    console.log('📬 BullMQ Email Worker started and listening for jobs...');

    return worker;
};











/* 


// -----------------------   previous email worker logic for default email sending ----------------------------------



import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { EmailQueue } from './emailQueue.model';
import { User } from '../module/Auth/auth.model';
import { IUserProfile } from '../module/User/user.interface';
import { sendEmail } from '../emails/email.sender';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { EMAIL_QUEUE_NAME } from './email.queue';
import { EMAIL_TEMPLATE_KEYS } from '../module/emailTemplateSystem/emailTemplate.constant';
import { ClientRegistrationDraft } from '../module/Auth/clientRegistrationDraft.model';
import { LawyerRegistrationDraft } from '../module/Auth/LawyerRegistrationDraft.model';
import { getAppSettings } from '../module/Settings/settingsConfig';


//Worker to process email jobs from BullMQ
 
export const startEmailWorker = async () => {
    const settings = await getAppSettings() as any;
    const emailSettings = settings?.emailSettings;

    const worker = new Worker(
        EMAIL_QUEUE_NAME,
        async (job: Job) => {
            const { mongoJobId, userId, email, templateKey, data: extraData } = job.data;

            try {
                // eslint-disable-next-line no-console
                console.log(`🚀 Processing BullMQ job ${job.id} for email: ${email}`);

                // 1. Deduplication guard — skip if this email was already sent
                if (mongoJobId) {
                    const existingRecord = await EmailQueue.findById(mongoJobId);
                    if (existingRecord?.status === 'sent') {
                        // eslint-disable-next-line no-console
                        console.warn(
                            `⚠️ Skipping job ${job.id}: email "${templateKey}" already sent to user ${userId}. (EmailQueue status: sent)`
                        );
                        return;
                    }
                }

                // 2. Broad Deduplication guard — skip if this template was EVER sent successfully to this user
                const alreadySent = await EmailQueue.findOne({
                    userId,
                    templateKey,
                    status: 'sent'
                });

                if (alreadySent) {
                    console.warn(`⚠️ Skipping: email "${templateKey}" already successfully sent to user ${userId} in a previous record.`);
                    if (mongoJobId) {
                        await EmailQueue.findByIdAndUpdate(mongoJobId, { status: 'sent' });
                    }
                    return;
                }

                // 3. Fetch User or Draft and check status
                let name = 'User';
                let shouldSend = true;

                if (templateKey === EMAIL_TEMPLATE_KEYS.CLIENT_DELAYED_ACTIVATION) {
                    const draft = await ClientRegistrationDraft.findById(userId);
                    if (!draft) {
                        shouldSend = false;
                        console.warn(`Skipping job ${job.id}: Client draft not found.`);
                    } else {
                        name = draft.leadDetails?.name || 'User';
                    }
                } else if (templateKey === EMAIL_TEMPLATE_KEYS.LAWYER_DELAYED_ACTIVATION) {
                    const draft = await LawyerRegistrationDraft.findById(userId);
                    if (!draft) {
                        shouldSend = false;
                        console.warn(`Skipping job ${job.id}: Lawyer draft not found.`);
                    } else {
                        name = draft.profile?.name || 'User';
                    }
                } else {
                    const user = await User.findById(userId).populate('profile');

                    // ALLOW BOTH APPROVED AND PENDING users to receive automated drip emails
                    const isValidStatus = user && [USER_STATUS.APPROVED, USER_STATUS.PENDING].includes(user.accountStatus as any);

                    if (!user || !isValidStatus) {
                        shouldSend = false;
                        const reason = !user ? 'User not found' : `User status is ${user.accountStatus}`;
                        console.warn(`Skipping job ${job.id}: ${reason}.`);
                    } else {
                        const profileInfo = user.profile as IUserProfile;
                        name = profileInfo?.name || 'User';
                    }
                }

                if (!shouldSend) {
                    if (mongoJobId) {
                        await EmailQueue.findByIdAndUpdate(mongoJobId, {
                            status: 'failed',
                            retryCount: job.attemptsMade + 1,
                        });
                    }
                    return;
                }

                // 3. Prepare data for variables
                const variableData = {
                    name,
                    email,
                    to: email,
                    ...(extraData || {}),
                };

                // 4. Send email using the unified sendEmail service
                await sendEmail({
                    to: email,
                    subject: '', // Service will fetch subject from template based on key
                    data: variableData,
                    emailTemplate: templateKey,
                });

                // 5. Update MongoDB record if it exists
                if (mongoJobId) {
                    await EmailQueue.findByIdAndUpdate(mongoJobId, {
                        status: 'sent',
                        sentAt: new Date(),
                    });
                }

                // eslint-disable-next-line no-console
                console.log(`✅ Email sent successfully for job ${job.id}`);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`❌ Error in BullMQ worker for job ${job.id}:`, error);

                if (mongoJobId) {
                    await EmailQueue.findByIdAndUpdate(mongoJobId, {
                        status: 'failed',
                        $inc: { retryCount: 1 },
                    });
                }

                // Throwing error allows BullMQ to handle retries based on queue config
                throw error;
            }
        },
        {
            connection: redisConnection,
            concurrency: emailSettings?.workerConcurrency || 5, // Process configured emails at a time
        }
    );

    worker.on('completed', job => {
        // eslint-disable-next-line no-console
        console.log(`✅ Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        // eslint-disable-next-line no-console
        console.error(`❌ Job ${job?.id} failed with ${err.message}`);
    });

    // eslint-disable-next-line no-console
    console.log('📬 BullMQ Email Worker started and listening for jobs...');

    return worker;
};









*/