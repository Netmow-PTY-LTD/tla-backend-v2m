import { emailFlowService } from '../../emails/email.flow.service';

/**
 * Task Registry
 * Maps dynamic task names from the database to actual executable functions.
 */
export const taskRegistry: Record<string, (payload?: Record<string, unknown>) => Promise<void> | void> = {
  // Existing tasks
  processScheduledEmails: async (payload?: Record<string, unknown>) => {
    console.log('🔄 Running Task: processScheduledEmails', payload || '');
    await emailFlowService.processScheduledEmails();
  },

  // Add more tasks here as needed
  testTask: async (payload?: Record<string, unknown>) => {
    console.log('🧪 Running Test Task with payload:', payload);
  },
};

export type TTaskName = keyof typeof taskRegistry;
