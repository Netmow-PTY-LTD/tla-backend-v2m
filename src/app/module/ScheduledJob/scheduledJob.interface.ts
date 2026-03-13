
export type TJobRunner = 'cron' | 'bullmq';
export type TJobStatus = 'success' | 'failed' | 'skipped';

export interface IScheduledJob {
  name: string;
  task: string;
  cron?: string;
  active: boolean;
  runner: TJobRunner;
  queueName?: string;
  payload?: Record<string, unknown>;
  attempts?: number;
  priority?: number;
  delay?: number;
  lastRunAt?: Date;
  lastStatus?: TJobStatus;
}
