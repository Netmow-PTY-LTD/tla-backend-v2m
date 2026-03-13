import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/bullmq.config';
import { bullMQTaskRegistry } from '../module/ScheduledJob/bullMQTaskRegistry';
import { ScheduledJobService } from '../module/ScheduledJob/scheduledJob.service';
import ScheduledJob from '../module/ScheduledJob/scheduledJob.model';

/**
 * Generic Worker to process BullMQ jobs using the task registry
 */
export const startGenericWorker = (queueName: string = 'default-queue') => {
  // eslint-disable-next-line no-console
  console.log(`👷 [${queueName}] Initializing worker instance...`);

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const taskName = job.name;
      // eslint-disable-next-line no-console
      console.log(`------- BULLMQ WORKER TRIGGERED (PID: ${process.pid}) -------`);
      // eslint-disable-next-line no-console
      console.log(`🔍 [${queueName}] Job Name: "${taskName}", Job ID: ${job.id}`);
      // eslint-disable-next-line no-console
      console.log(`📦 [${queueName}] Job Data:`, JSON.stringify(job.data));

      // Identify the MongoDB Job ID for tracking (priority: job.data > job.id)
      let mongoJobId = job.data?.mongoJobId;

      // Robust extraction from job.id (especially for repeatable jobs)
      if (!mongoJobId && job.id) {
        // Find any 24-character hex string in the ID (likely the MongoDB ID)
        const match = job.id.match(/[0-9a-fA-F]{24}/);
        if (match) {
          mongoJobId = match[0];
          // eslint-disable-next-line no-console
          console.log(`🆔 [${queueName}] Extracted mongoJobId from job.id: ${mongoJobId}`);
        }
      }

      // eslint-disable-next-line no-console
      console.log(`🆔 [${queueName}] Resolved mongoJobId: ${mongoJobId || 'None'} from BullMQ ID: ${job.id}`);

      // 1. Fetch the task configuration from the database
      let jobConfig = null;
      let isScheduledJobRecord = false;
      
      if (mongoJobId) {
        jobConfig = await ScheduledJob.findById(mongoJobId);
        // eslint-disable-next-line no-console
        console.log(`🔍 [${queueName}] DB Lookup by ID (${mongoJobId}): ${jobConfig ? 'FOUND' : 'NOT FOUND'}`);
        
        // Only accept it if it's actually a BullMQ record
        if (jobConfig && jobConfig.runner === 'bullmq') {
          isScheduledJobRecord = true;
        } else if (jobConfig) {
          // eslint-disable-next-line no-console
          console.log(`⚠️ [${queueName}] Record found by ID has WRONG runner: ${jobConfig.runner} (expected bullmq)`);
          jobConfig = null;
        }
      }
      
      // Fallback to task name if ID lookup fails
      if (!jobConfig) {
        jobConfig = await ScheduledJob.findOne({ task: taskName, runner: 'bullmq' });
        // eslint-disable-next-line no-console
        console.log(`🔍 [${queueName}] DB Fallback Lookup by Task ("${taskName}"): ${jobConfig ? 'FOUND' : 'NOT FOUND'}`);
      }

      // 2. Guard: If the task is a scheduled entry and explicitly disabled, skip execution
      if (jobConfig && !jobConfig.active) {
        // eslint-disable-next-line no-console
        console.warn(`⏸️ [${queueName}] Task "${taskName}" is INACTIVE. ID: ${jobConfig._id}`);
        
        // Update tracking to show it was skipped
        const trackingId = isScheduledJobRecord && mongoJobId ? mongoJobId : (jobConfig?._id ? jobConfig._id.toString() : null);
        
        if (trackingId) {
          // eslint-disable-next-line no-console
          console.log(`📝 [${queueName}] (PID: ${process.pid}) Recording "skipped" status for ID: ${trackingId}`);
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
        console.log(`🚀 [${queueName}] (PID: ${process.pid}) Processing BullMQ job: ${taskName} [ID: ${job.id}]`);

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

  worker.on('ready', () => {
    // eslint-disable-next-line no-console
    console.log(`🔌 [${queueName}] Worker is READY and connected to Redis (PID: ${process.pid})`);
  });

  worker.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(`☢️ [${queueName}] Worker Error:`, err);
  });

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
