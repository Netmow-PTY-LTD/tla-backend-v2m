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
      // eslint-disable-next-line no-console
      console.log(`🔍 [${queueName}] Triggered job: "${taskName}" [BullMQ ID: ${job.id}]`);

      // Identify the MongoDB Job ID for tracking (priority: job.data > job.id)
      let mongoJobId = job.data?.mongoJobId;

      // Robust extraction from job.id (especially for repeatable jobs)
      if (!mongoJobId && job.id) {
        // Find any 24-character hex string in the ID (likely the MongoDB ID)
        const match = job.id.match(/[0-9a-fA-F]{24}/);
        if (match) {
          mongoJobId = match[0];
        }
      }

      // eslint-disable-next-line no-console
      console.log(`🆔 [${queueName}] Resolved mongoJobId: ${mongoJobId || 'None'} from BullMQ ID: ${job.id}`);

      // 1. Fetch the task configuration from the database
      const { ScheduledJob } = await import('../module/ScheduledJob/scheduledJob.model');
      
      let jobConfig = null;
      let isScheduledJobRecord = false;
      
      if (mongoJobId) {
        jobConfig = await ScheduledJob.findById(mongoJobId);
        // Only accept it if it's actually a BullMQ record
        if (jobConfig && jobConfig.runner === 'bullmq') {
          isScheduledJobRecord = true;
        } else {
          jobConfig = null;
        }
      }
      
      // Fallback to task name if ID lookup fails (e.g. mongoJobId was an EmailQueue ID, or no ID was passed)
      if (!jobConfig) {
        jobConfig = await ScheduledJob.findOne({ task: taskName, runner: 'bullmq' });
      }

      // 2. Guard: If the task is a scheduled entry and explicitly disabled, skip execution
      if (jobConfig && !jobConfig.active) {
        // eslint-disable-next-line no-console
        console.warn(`⏸️ [${queueName}] Skipping task "${taskName}": Currently INACTIVE in configuration.`);
        
        // Update tracking to show it was skipped
        const trackingId = isScheduledJobRecord && mongoJobId ? mongoJobId : (jobConfig?._id ? jobConfig._id.toString() : null);
        if (trackingId) {
          await ScheduledJobService.updateLastRunInDB(trackingId, 'skipped');
        }
        return;
      }

      const handler = bullMQTaskRegistry[taskName];
      if (!handler) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ [${queueName}] No handler found for task: "${taskName}"`);
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log(`🚀 [${queueName}] Processing BullMQ job: ${taskName} [ID: ${job.id}]`);

        await handler(job.data, job.id);

        // 3. Update tracking in ScheduledJob collection
        const trackingId = isScheduledJobRecord && mongoJobId ? mongoJobId : (jobConfig?._id ? jobConfig._id.toString() : null);
        if (trackingId) {
          await ScheduledJobService.updateLastRunInDB(trackingId, 'success');
        }

        // eslint-disable-next-line no-console
        console.log(`✅ [${queueName}] Completed BullMQ job: ${taskName} [ID: ${job.id}]`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ [${queueName}] Error in task "${taskName}":`, error);

        const trackingId = isScheduledJobRecord && mongoJobId ? mongoJobId : (jobConfig?._id ? jobConfig._id.toString() : null);
        if (trackingId) {
          await ScheduledJobService.updateLastRunInDB(trackingId, 'failed');
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
