import cron from 'node-cron';
import { EmailQueue } from '../module/Email/emailQueue.model';
import { User } from '../module/Auth/auth.model';
import { IUser } from '../module/Auth/auth.interface';
import { IUserProfile } from '../module/User/user.interface';
import { sendEmail } from '../emails/email.service';
import { USER_STATUS } from '../module/Auth/auth.constant';

// To prevent overlapping runs
let isProcessing = false;

/**
 * Worker to process pending emails in the queue
 * Logic: Every 1 minute, process up to 50 pending email jobs.
 */
export const startEmailWorker = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        if (isProcessing) {
            // eslint-disable-next-line no-console
            console.log('🔄 Email Worker is already busy. Skipping this cycle.');
            return;
        }

        isProcessing = true;
        try {
            // eslint-disable-next-line no-console
            console.log('📬 Checking for pending emails...');

            const now = new Date();
            // Find up to 50 pending emails that are due
            const pendingJobs = await EmailQueue.find({
                status: 'pending',
                scheduledAt: { $lte: now },
            })
                .limit(50)
                .sort({ scheduledAt: 1 });

            if (pendingJobs.length === 0) {
                isProcessing = false;
                return;
            }

            // eslint-disable-next-line no-console
            console.log(`🚀 Processing ${pendingJobs.length} emails...`);

            // 1. Pre-fetch needed Users to reduce DB calls
            const userIds = [...new Set(pendingJobs.map(j => j.userId.toString()))];

            // Only fetch approved users
            const users = await User.find({ _id: { $in: userIds }, accountStatus: USER_STATUS.APPROVED }).populate('profile');

            const userMap = new Map<string, IUser>();
            users.forEach(u => userMap.set(u._id!.toString(), u));

            // 2. Process in small chunks (e.g., 5 at a time) to avoid burst-blocking Mailgun
            const chunkSize = 5;
            for (let i = 0; i < pendingJobs.length; i += chunkSize) {
                const chunk = pendingJobs.slice(i, i + chunkSize);

                await Promise.allSettled(
                    chunk.map(async job => {
                        try {
                            const user = userMap.get(job.userId.toString());

                            if (!user) {
                                console.warn(`Skipping job ${job._id}: User not found or not approved.`);
                                await EmailQueue.findByIdAndUpdate(job._id, {
                                    status: 'failed',
                                    retryCount: (job.retryCount || 0) + 1,
                                });
                                return;
                            }

                            // Prepare data for variables
                            const profileInfo = user.profile as IUserProfile;
                            const variableData = {
                                name: profileInfo?.name || 'User',
                                email: user.email,
                                to: user.email,
                                // Add more personalized fields if needed
                            };

                            // Send email using the unified sendEmail service
                            // This service fetches the template, interpolates, and adds layout automatically
                            await sendEmail({
                                to: job.email,
                                subject: '', // Service will fetch subject from template based on key
                                data: variableData,
                                emailTemplate: job.templateKey,
                            });

                            // Update job status
                            await EmailQueue.findByIdAndUpdate(job._id, {
                                status: 'sent',
                                sentAt: new Date(),
                            });
                        } catch (jobError) {
                            console.error(`❌ Error processing email job ${job._id}:`, jobError);
                            await EmailQueue.findByIdAndUpdate(job._id, {
                                status: 'failed',
                                $inc: { retryCount: 1 },
                            });
                        }
                    })
                );

                // Small delay between chunks to preserve system performance and avoid rate limits
                if (i + chunkSize < pendingJobs.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            console.log('✅ Email Worker cycle completed.');
        } catch (error) {
            console.error('❌ Critical Error in Email Worker:', error);
        } finally {
            isProcessing = false;
        }
    });
};
