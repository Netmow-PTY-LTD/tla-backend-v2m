import cron from 'node-cron';
import { emailFlowService } from '../module/Email/email.service';

/**
 * Email Scheduler Cron Job
 * Logic: Every 1 minute, find users who need their next email sent.
 * It will determine the template, insert into the queue, and update user flow progress.
 */
export const startEmailSchedulerCron = () => {
    // Run every 1 minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('🔄 Running Email Scheduler Cron...');
            await emailFlowService.processScheduledEmails();
            console.log('✅ Email Scheduler Cron completed successfully.');
        } catch (error) {
            console.error('❌ Error in Email Scheduler Cron:', error);
        }
    });
};
