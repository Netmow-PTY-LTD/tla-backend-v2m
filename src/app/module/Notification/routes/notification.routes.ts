import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';

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
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  notificationController.NotificationPreferences,
);

export const notificationRouter = router;
