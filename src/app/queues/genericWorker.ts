import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { bullMQTaskRegistry } from '../module/ScheduledJob/bullMQTaskRegistry';

/**
 * Generic Worker to process BullMQ jobs using the task registry
 */
export const startGenericWorker = (queueName: string = 'default-queue') => {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const taskName = job.name;
      const handler = bullMQTaskRegistry[taskName];

      if (!handler) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ No handler found in bullMQTaskRegistry for task: "${taskName}"`);
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log(`🚀 Processing BullMQ job: ${taskName} [ID: ${job.id}]`);
        await handler(job.data, job.id);
        // eslint-disable-next-line no-console
        console.log(`✅ Completed BullMQ job: ${taskName} [ID: ${job.id}]`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error in BullMQ generic worker for task "${taskName}":`, error);
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
    console.log(`✅ Job ${job.id} (task: ${job.name}) completed!`);
  });

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`❌ Job ${job?.id} (task: ${job?.name}) failed: ${err.message}`);
  });

  // eslint-disable-next-line no-console
  console.log(`📬 Generic BullMQ Worker started for queue: "${queueName}"`);
  return worker;
};
