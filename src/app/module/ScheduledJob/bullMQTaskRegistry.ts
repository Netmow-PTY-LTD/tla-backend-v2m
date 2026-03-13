import { emailFlowService } from '../../emails/email.flow.service';
import { handleEmailJob } from '../../queues/emailWorker';

/**
 * BullMQ Task Registry
 * Maps dynamic task names from the database/queue to actual executable functions.
 */
export const bullMQTaskRegistry: Record<
  string,
  (data: Record<string, unknown>, jobId?: string) => Promise<void> | void
> = {
  // 📨 Main Email Task
  'send-email': async (data: Record<string, unknown>, jobId?: string) => {
    await handleEmailJob(data, jobId);
  },

  // 📧 Email Flow Scheduler (Can be run via BullMQ or Cron)
  processScheduledEmails: async () => {
    // eslint-disable-next-line no-console
    console.log('🔄 BullMQ: Running processScheduledEmails');
    await emailFlowService.processScheduledEmails();
  },

  // Add more BullMQ specific tasks here
  testBullMQTask: async (data: Record<string, unknown>, jobId?: string) => {
    // eslint-disable-next-line no-console
    console.log(
      `🧪 BullMQ Registry: Executing testBullMQTask [Job ID: ${jobId}]`,
      data
    );
  },
};

export type TBullMQTaskName = keyof typeof bullMQTaskRegistry;
