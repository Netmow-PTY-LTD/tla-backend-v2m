import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ScheduledJobController } from './scheduledJob.controller';
import { ScheduledJobValidation } from './scheduledJob.validation';

const router = express.Router();

router.post(
  '/create-job',
  validateRequest(ScheduledJobValidation.createScheduledJobValidationSchema),
  ScheduledJobController.createScheduledJob
);

router.get(
  '/task-names',
  ScheduledJobController.getAvailableTasks
);

router.get(
  '/',
  ScheduledJobController.getAllScheduledJobs
);

router.patch(
  '/:id',
  validateRequest(ScheduledJobValidation.updateScheduledJobValidationSchema),
  ScheduledJobController.updateScheduledJob
);

router.delete(
  '/:id',
  ScheduledJobController.deleteScheduledJob
);

export const ScheduledJobRoutes = router;
