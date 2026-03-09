import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { EmailQueue } from './emailQueue.model';
import { User } from '../module/Auth/auth.model';
import { IUserProfile } from '../module/User/user.interface';
import { sendEmail } from '../emails/email.service';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { EMAIL_QUEUE_NAME } from './email.queue';

/**
 * Worker to process email jobs from BullMQ
 */
export const startEmailWorker = () => {
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

                // 2. Fetch User and check status
                const user = await User.findById(userId).populate('profile');

                if (!user || user.accountStatus !== USER_STATUS.APPROVED) {
                    const reason = !user ? 'User not found' : 'User not approved';
                    // eslint-disable-next-line no-console
                    console.warn(`Skipping job ${job.id}: ${reason}.`);

                    if (mongoJobId) {
                        await EmailQueue.findByIdAndUpdate(mongoJobId, {
                            status: 'failed',
                            retryCount: job.attemptsMade + 1,
                        });
                    }
                    return;
                }

                // 3. Prepare data for variables
                const profileInfo = user.profile as IUserProfile;
                const variableData = {
                    name: profileInfo?.name || 'User',
                    email: user.email,
                    to: user.email,
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
            concurrency: 5, // Process 5 emails at a time
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
