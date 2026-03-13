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
    // Dynamically fetch configurations from ScheduledJob database (set via Admin Panel)
    const { ScheduledJob } = await import('../module/ScheduledJob/scheduledJob.model');

    // Find the BullMQ configuration for the 'send-email' task
    const jobConfig = await ScheduledJob.findOne({ task: 'send-email', runner: 'bullmq' });

    // If the task is explicitly disabled in the admin panel, stop here
    if (jobConfig && jobConfig.active === false) {
        // eslint-disable-next-line no-console
        console.warn(`🛑 Skipping email enqueue: 'send-email' task is currently INACTIVE in ScheduledJob settings.`);
        
        // Update the specific record if mongoJobId is present
        if (data.mongoJobId) {
            const { ScheduledJobService } = await import('../module/ScheduledJob/scheduledJob.service');
            await ScheduledJobService.updateLastRunInDB(data.mongoJobId.toString(), 'skipped');
        }
        return;
    }

    return await emailQueue.add('send-email', data, {
        jobId: data.mongoJobId ? data.mongoJobId.toString() : undefined,
        attempts: jobConfig?.attempts || 3,
        priority: jobConfig?.priority || 1,
        delay: jobConfig?.delay || 0,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};



/* 

import { Queue } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';

import { getAppSettings } from '../module/Settings/settingsConfig';

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
    const settings = await getAppSettings() as any;
    const emailSettings = settings?.emailSettings;

    return await emailQueue.add('send-email', data, {
        jobId: data.mongoJobId ? data.mongoJobId.toString() : undefined,
        attempts: emailSettings?.maxRetries || 3,
    });
};







*/