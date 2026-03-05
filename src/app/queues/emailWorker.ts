import cron from 'node-cron';
import { EmailQueue } from '../module/Email/emailQueue.model';
import { EmailTemplate } from '../module/emailSystem/emailTemplate.model';
import { User } from '../module/Auth/auth.model';
import { emailService } from '../services/emailService';

/**
 * Worker to process pending emails in the queue
 * Logic: Every 1 minute, process up to 50 pending email jobs.
 */
export const startEmailWorker = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('📬 Running Email Queue Worker...');

            const now = new Date();
            // Find up to 50 pending emails in the queue that should have been sent
            const pendingJobs = await EmailQueue.find({
                status: 'pending',
                scheduledAt: { $lte: now },
            })
                .limit(50)
                .sort({ scheduledAt: 1 });

            if (pendingJobs.length === 0) {
                console.log('✅ No pending emails to process.');
                return;
            }

            console.log(`🚀 Processing ${pendingJobs.length} emails...`);

            for (const job of pendingJobs) {
                try {
                    // 1. Load user for personalized data (variables)
                    const user = await User.findById(job.userId).populate('profile');
                    if (!user) {
                        console.warn(`User ${job.userId} not found for email job ${job._id}. Skipping.`);
                        await EmailQueue.findByIdAndUpdate(job._id, { status: 'failed', retryCount: job.retryCount + 1 });
                        continue;
                    }

                    // 2. Load email template
                    const template = await EmailTemplate.findOne({ templateKey: job.templateKey });
                    if (!template) {
                        console.warn(`Template ${job.templateKey} not found for email job ${job._id}. Skipping.`);
                        await EmailQueue.findByIdAndUpdate(job._id, { status: 'failed', retryCount: job.retryCount + 1 });
                        continue;
                    }

                    // 3. Prepare data for variables
                    const variableData = {
                        name: (user.profile as any)?.name || 'User',
                        email: user.email,
                        // add more as needed
                    };

                    // 4. Send email using core emailService
                    await emailService.sendEmail({
                        to: job.email,
                        subject: emailService.replaceVariables(template.subject, variableData),
                        html: emailService.replaceVariables(template.body, variableData),
                    });

                    // 5. Update status upon success
                    await EmailQueue.findByIdAndUpdate(job._id, {
                        status: 'sent',
                        sentAt: new Date(),
                    });
                } catch (jobError) {
                    console.error(`❌ Error processing email job ${job._id}:`, jobError);
                    // Update status upon failure
                    await EmailQueue.findByIdAndUpdate(job._id, {
                        status: 'failed',
                        $inc: { retryCount: 1 },
                    });
                }
            }

            console.log('✅ Email Worker cycle completed.');
        } catch (error) {
            console.error('❌ Error in Email Worker:', error);
        }
    });
};
