import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { EmailQueue } from '../module/Email/emailQueue.model';
import { User } from '../module/Auth/auth.model';
import { IUserProfile } from '../module/User/user.interface';
import { sendEmail } from '../emails/email.service';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { EMAIL_QUEUE_NAME } from '../module/Email/email.queue';

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

                // 1. Fetch User and check status
                const user = await User.findById(userId).populate('profile');

                if (!user || user.accountStatus !== USER_STATUS.APPROVED) {
                    const reason = !user ? 'User not found' : 'User not approved';
                    console.warn(`Skipping job ${job.id}: ${reason}.`);

                    if (mongoJobId) {
                        await EmailQueue.findByIdAndUpdate(mongoJobId, {
                            status: 'failed',
                            retryCount: job.attemptsMade + 1,
                        });
                    }
                    return;
                }

                // 2. Prepare data for variables
                const profileInfo = user.profile as IUserProfile;
                const variableData = {
                    name: profileInfo?.name || 'User',
                    email: user.email,
                    to: user.email,
                    ...(extraData || {}),
                };

                // 3. Send email using the unified sendEmail service
                await sendEmail({
                    to: email,
                    subject: '', // Service will fetch subject from template based on key
                    data: variableData,
                    emailTemplate: templateKey,
                });

                // 4. Update MongoDB record if it exists
                if (mongoJobId) {
                    await EmailQueue.findByIdAndUpdate(mongoJobId, {
                        status: 'sent',
                        sentAt: new Date(),
                    });
                }

                console.log(`✅ Email sent successfully for job ${job.id}`);
            } catch (error) {
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

    console.log('📬 BullMQ Email Worker started and listening for jobs...');

    return worker;
};
