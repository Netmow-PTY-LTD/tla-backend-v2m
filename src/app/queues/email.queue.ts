/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';

export const EMAIL_QUEUE_NAME = 'email-queue';


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

export const addEmailToQueue = async (data: Record<string, any>) => {
    return await emailQueue.add('send-email', data, { jobId: data.mongoJobId ? data.mongoJobId.toString() : undefined });
};

