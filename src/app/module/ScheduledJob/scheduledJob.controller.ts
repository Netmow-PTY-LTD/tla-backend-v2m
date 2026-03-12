import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ScheduledJobService } from './scheduledJob.service';
import { jobManager } from './jobManager';

const createScheduledJob = catchAsync(async (req, res) => {
  const result = await ScheduledJobService.createScheduledJobIntoDB(req.body);

  // Trigger JobManager
  if (result.runner === 'cron') {
    jobManager.scheduleCronJob(result);
  } else {
    await jobManager.upsertBullMQJob(result);
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Scheduled job created successfully',
    data: result,
  });
});

const getAllScheduledJobs = catchAsync(async (req, res) => {
  const result = await ScheduledJobService.getAllScheduledJobsFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Scheduled jobs retrieved successfully',
    data: result,
  });
});

const updateScheduledJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Get old data to check runner change
  const oldJobData = await ScheduledJobService.getAllScheduledJobsFromDB();
  const oldJob = oldJobData.find(j => j._id.toString() === id);

  const result = await ScheduledJobService.updateScheduledJobIntoDB(id, req.body);

  if (result) {
    // If runner type changed, stop the old one
    if (oldJob && oldJob.runner !== result.runner) {
      if (oldJob.runner === 'cron') {
        jobManager.stopCronJob(id);
      } else {
        await jobManager.stopBullMQJob(id, oldJob.queueName);
      }
    }

    // Schedule the new/updated one
    if (result.runner === 'cron') {
      jobManager.scheduleCronJob(result);
    } else {
      await jobManager.upsertBullMQJob(result);
    }
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Scheduled job updated and rescheduled successfully',
    data: result,
  });
});

const deleteScheduledJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const jobs = await ScheduledJobService.getAllScheduledJobsFromDB();
  const targetJob = jobs.find(j => j._id.toString() === id);
  
  await ScheduledJobService.deleteScheduledJobFromDB(id);

  if (targetJob) {
    if (targetJob.runner === 'cron') {
      jobManager.stopCronJob(id);
    } else {
      await jobManager.stopBullMQJob(id, targetJob.queueName);
    }
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Scheduled job deleted successfully',
    data: null,
  });
});

export const ScheduledJobController = {
  createScheduledJob,
  getAllScheduledJobs,
  updateScheduledJob,
  deleteScheduledJob,
};
