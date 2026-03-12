import { IScheduledJob } from './scheduledJob.interface';
import { ScheduledJob } from './scheduledJob.model';
import { taskRegistry } from './taskRegistry';
import { bullMQTaskRegistry } from './bullMQTaskRegistry';

const createScheduledJobIntoDB = async (payload: IScheduledJob) => {
  const result = await ScheduledJob.create(payload);
  return result;
};

const getAllScheduledJobsFromDB = async () => {
  const result = await ScheduledJob.find();
  return result;
};

const getScheduledJobByIdFromDB = async (id: string) => {
  const result = await ScheduledJob.findById(id);
  return result;
};

const getActiveCronJobsFromDB = async () => {
  const result = await ScheduledJob.find({
    runner: 'cron',
    active: true,
  });
  return result;
};

const getActiveBullMQJobsFromDB = async () => {
  const result = await ScheduledJob.find({
    runner: 'bullmq',
    active: true,
  });
  return result;
};

const updateLastRunInDB = async (id: string, status: 'success' | 'failed') => {
  const result = await ScheduledJob.findByIdAndUpdate(id, {
    lastRunAt: new Date(),
    lastStatus: status,
  });
  return result;
};

const updateScheduledJobIntoDB = async (id: string, payload: Partial<IScheduledJob>) => {
  const result = await ScheduledJob.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteScheduledJobFromDB = async (id: string) => {
  const result = await ScheduledJob.findByIdAndDelete(id);
  return result;
};

const formatTaskName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

const getAvailableTasks = () => {
  return {
    cron: Object.keys(taskRegistry).map((task) => ({
      label: formatTaskName(task),
      value: task,
    })),
    bullmq: Object.keys(bullMQTaskRegistry).map((task) => ({
      label: formatTaskName(task),
      value: task,
    })),
  };
};

export const ScheduledJobService = {
  createScheduledJobIntoDB,
  getAllScheduledJobsFromDB,
  getScheduledJobByIdFromDB,
  getActiveCronJobsFromDB,
  getActiveBullMQJobsFromDB,
  updateScheduledJobIntoDB,
  updateLastRunInDB,
  deleteScheduledJobFromDB,
  getAvailableTasks,
};
