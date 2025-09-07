import { Router } from 'express';
import { notificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = Router();

router.put(
  '/browser',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.browserPreferences,
);

router.put(
  '/email',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.emailPreferences,
);
router.get(
  '/preferences',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.NotificationPreferences,
);

router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.getUserNotifications,
);

router.put(
  '/:notificationId/red',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.markNotificationAsRead,
);

export const notificationRouter = router;
