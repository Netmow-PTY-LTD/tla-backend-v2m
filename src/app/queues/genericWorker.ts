import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { bullMQTaskRegistry } from '../module/ScheduledJob/bullMQTaskRegistry';
import { ScheduledJobService } from '../module/ScheduledJob/scheduledJob.service';

/**
 * Generic Worker to process BullMQ jobs using the task registry
 */
export const startGenericWorker = (queueName: string = 'default-queue') => {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const taskName = job.name;
      // 1. Fetch the task configuration from the database
      const { ScheduledJob } = await import('../module/ScheduledJob/scheduledJob.model');
      const jobConfig = await ScheduledJob.findOne({ task: taskName });

      // 2. Guard: If the task is explicitly disabled, skip execution
      if (jobConfig && !jobConfig.active) {
        // eslint-disable-next-line no-console
        console.warn(`⏸️ [${queueName}] Skipping task "${taskName}": Currently INACTIVE in configuration.`);
        return;
      }

      const handler = bullMQTaskRegistry[taskName];
      if (!handler) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ [${queueName}] No handler found for task: "${taskName}"`);
        return;
      }

      // Identify the MongoDB Job ID for tracking (priority: job.data > job.id)
      let mongoJobId = job.data?.mongoJobId;

      if (!mongoJobId && job.id) {
        if (/^[0-9a-fA-F]{24}$/.test(job.id)) {
          mongoJobId = job.id;
        } else if (job.id.startsWith('repeat:')) {
          const parts = job.id.split(':');
          if (parts[1] && /^[0-9a-fA-F]{24}$/.test(parts[1])) {
            mongoJobId = parts[1];
          }
        }
      }

      try {
        // eslint-disable-next-line no-console
        console.log(`🚀 [${queueName}] Processing BullMQ job: ${taskName} [ID: ${job.id}]`);

        await handler(job.data, job.id);

        // 3. Update tracking in ScheduledJob collection
        // If we have a specific ID, use it. Otherwise, update by task name for generic runner tracking.
        if (mongoJobId) {
          await ScheduledJobService.updateLastRunInDB(mongoJobId, 'success');
        } else if (jobConfig) {
          await ScheduledJobService.updateLastRunInDB(jobConfig._id.toString(), 'success');
        }

        // eslint-disable-next-line no-console
        console.log(`✅ [${queueName}] Completed BullMQ job: ${taskName} [ID: ${job.id}]`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ [${queueName}] Error in task "${taskName}":`, error);

        if (mongoJobId) {
          await ScheduledJobService.updateLastRunInDB(mongoJobId, 'failed');
        } else if (jobConfig) {
          await ScheduledJobService.updateLastRunInDB(jobConfig._id.toString(), 'failed');
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`✅ [${queueName}] Job ${job.id} completed!`);
  });

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`❌ [${queueName}] Job ${job?.id} failed: ${err.message}`);
  });

  // eslint-disable-next-line no-console
  console.log(`📬 Generic BullMQ Worker started for queue: "${queueName}"`);
  return worker;
};
