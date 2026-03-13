import cron, { ScheduledTask } from 'node-cron';
import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../../config/bullmq.config';
import { taskRegistry } from './taskRegistry';
import { ScheduledJobService } from './scheduledJob.service';
import { IScheduledJob } from './scheduledJob.interface';
import { Types } from 'mongoose';
import { startGenericWorker } from '../../queues/genericWorker';
import ScheduledJob from './scheduledJob.model';

class JobManager {
  private cronJobs: Map<string, ScheduledTask> = new Map();
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  /**
   * Initialize all jobs on startup
   */
  async initialize() {
    console.log('🔄 Initializing Job Manager...');

    // Load ALL jobs to sync state (stop inactive ones)
    const allJobs = await ScheduledJob.find();

    for (const job of allJobs) {
      if (job.runner === 'cron') {
        this.scheduleCronJob(job as IScheduledJob & { _id: Types.ObjectId });
      } else {
        await this.upsertBullMQJob(job as IScheduledJob & { _id: Types.ObjectId });
      }
    }

    console.log('✅ Job Manager initialized.');
  }

  /**
   * Schedule or Reschedule a Cron Job
   */
  scheduleCronJob(job: IScheduledJob & { _id: Types.ObjectId }) {
    const jobId = job._id.toString();

    // Stop existing job if any
    if (this.cronJobs.has(jobId)) {
      this.cronJobs.get(jobId)?.stop();
      this.cronJobs.delete(jobId);
    }

    if (!job.active || !job.cron) return;

    const taskFunction = taskRegistry[job.task];
    if (!taskFunction) {
      console.warn(`⚠️ Task function "${job.task}" not found for job "${job.name}".`);
      return;
    }

    const scheduledTask = cron.schedule(job.cron, async () => {
      try {
        console.log(`🚀 Executing dynamic cron task: ${job.name}`);
        await taskFunction(job.payload);
        await ScheduledJobService.updateLastRunInDB(jobId, 'success');
      } catch (error) {
        console.error(`❌ Error executing dynamic cron task "${job.name}":`, error);
        await ScheduledJobService.updateLastRunInDB(jobId, 'failed');
      }
    });

    this.cronJobs.set(jobId, scheduledTask);
    console.log(`✅ Scheduled dynamic cron: ${job.name} [${job.cron}]`);
  }

  /**
   * Add or Update a BullMQ Job
   */
  async upsertBullMQJob(job: IScheduledJob & { _id: Types.ObjectId }) {
    const queueName = job.queueName || 'default-queue';
    const jobId = job._id.toString();

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, new Queue(queueName, { connection: redisConnection }));
    }

    const queue = this.queues.get(queueName)!;

    // Ensure a worker is running for this queue
    this.ensureWorkerRunning(queueName);

    // For repeatable jobs, we should remove existing ones first to avoid duplicates
    if (job.cron) {
      // Find and remove existing job scheduler for this specific job ID
      // We use the jobId as the schedulerId for uniqueness
      await queue.removeJobScheduler(jobId);

      if (job.active) {
        await queue.upsertJobScheduler(jobId, {
          pattern: job.cron,
        }, {
          name: job.task,
          data: { ...job.payload, mongoJobId: jobId }, // Ensure mongoJobId is passed
          opts: {
            attempts: job.attempts || 3,
            priority: job.priority || 1,
          }
        });
        console.log(`✅ Added/Updated job scheduler in BullMQ: ${job.name} [ID: ${jobId}]`);
      }
    } else {
      // One-time job logic
      if (job.active) {
        await queue.add(job.task, { ...job.payload, mongoJobId: jobId }, {
          attempts: job.attempts || 3,
          priority: job.priority || 1,
          jobId: jobId,
          delay: job.delay || 0,
        });
        console.log(`✅ Enqueued/Updated one-time job to BullMQ: ${job.name}`);
      } else {
        // If inactive, try to remove the pending job if it exists
        const pendingJob = await queue.getJob(jobId);
        if (pendingJob) {
          await pendingJob.remove();
          console.log(`🛑 Removed pending one-time job from BullMQ: ${job.name}`);
        }
      }
    }
  }

  /**
   * Stop a Cron Job
   */
  stopCronJob(jobId: string) {
    if (this.cronJobs.has(jobId)) {
      this.cronJobs.get(jobId)?.stop();
      this.cronJobs.delete(jobId);
      console.log(`🛑 Stopped cron job: ${jobId}`);
    }
  }

  /**
   * Stop/Remove a BullMQ Job
   */
  async stopBullMQJob(jobId: string, queueName: string = 'default-queue') {
    if (this.queues.has(queueName)) {
      const queue = this.queues.get(queueName)!;
      await queue.removeJobScheduler(jobId);
      console.log(`🛑 Stopped BullMQ scheduler: ${jobId}`);
    }
  }

  /**
   * Ensure a generic worker is running for a specific queue
   */
  public ensureWorkerRunning(queueName: string) {
    if (!this.workers.has(queueName)) {
      console.log(`👷 Starting generic worker for queue: "${queueName}"`);
      const worker = startGenericWorker(queueName);
      this.workers.set(queueName, worker);
    }
  }
}

export const jobManager = new JobManager();
