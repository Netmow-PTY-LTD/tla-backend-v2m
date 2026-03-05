import { Worker } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { emailFlowService } from '../module/Email/email.service';
import { EMAIL_SCHEDULER_QUEUE_NAME } from '../module/Email/email.queue';

/**
 * Email Scheduler Worker (BullMQ version of Cron)
 * Logic: Triggered by a repeatable jobEvery 1 minute, finds users who need their next email sent.
 */
export const startEmailSchedulerCron = () => {
    const worker = new Worker(
        EMAIL_SCHEDULER_QUEUE_NAME,
        async () => {
            try {
                console.log('🔄 BullMQ Scheduler: Processing pending email flows...');
                await emailFlowService.processScheduledEmails();
                console.log('✅ BullMQ Scheduler: Processing completed.');
            } catch (error) {
                console.error('❌ BullMQ Scheduler Error:', error);
                throw error;
            }
        },
        { connection: redisConnection }
    );

    worker.on('failed', (job, err) => {
        console.error(`❌ Scheduler Job ${job?.id} failed:`, err);
    });

    console.log('🕒 BullMQ Email Scheduler Worker started.');
    return worker;
};
