import { Schema, model } from 'mongoose';
import { IScheduledJob } from './scheduledJob.interface';

const scheduledJobSchema = new Schema<IScheduledJob>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    cron: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    runner: {
      type: String,
      enum: ['cron', 'bullmq'],
      required: true,
    },
    queueName: {
      type: String,
    },
    payload: {
      type: Object,
      default: {},
    },
    attempts: {
      type: Number,
      default: 3,
    },
    priority: {
      type: Number,
      default: 1,
    },
    delay: {
      type: Number,
      default: 0,
    },
    lastRunAt: {
      type: Date,
    },
    lastStatus: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
    },
  },
  {
    timestamps: true,
  }
);

export const ScheduledJob = model<IScheduledJob>('ScheduledJob', scheduledJobSchema);
export default ScheduledJob;
