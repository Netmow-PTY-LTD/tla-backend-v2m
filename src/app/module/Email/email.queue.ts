import { Queue } from 'bullmq';
import { redisConnection } from '../../config/bullmq.config';

export const EMAIL_QUEUE_NAME = 'email-queue';
export const EMAIL_SCHEDULER_QUEUE_NAME = 'email-scheduler-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const addEmailToQueue = async (data: Record<string, unknown>) => {
    return await emailQueue.add('send-email', data);
};

export const emailSchedulerQueue = new Queue(EMAIL_SCHEDULER_QUEUE_NAME, {
    connection: redisConnection,
});

export const initEmailScheduler = async () => {
    // Add a repeatable job that runs every minute
    await emailSchedulerQueue.add(
        'process-email-flow',
        {},
        {
            repeat: {
                pattern: '* * * * *', // Every minute
            },
            jobId: 'email-flow-scheduler', // Unique ID to prevent duplicates
            removeOnComplete: true,
            removeOnFail: true,
        }
    );
    console.log('✅ Email scheduler repeatable job initialized.');
};
