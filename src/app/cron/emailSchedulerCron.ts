import cron from 'node-cron';
import { emailFlowService } from '../module/Email/email.service';

/**
 * Email Scheduler Cron
 * Logic: Every 1 minute, finds users who need their next email sent.
 */
export const startEmailSchedulerCron = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('🔄 Cron Scheduler: Processing pending email flows...');
            await emailFlowService.processScheduledEmails();
            console.log('✅ Cron Scheduler: Processing completed.');
        } catch (error) {
            console.error('❌ Cron Scheduler Error:', error);
        }
    });

    console.log('🕒 Node-Cron Email Scheduler started.');
};

