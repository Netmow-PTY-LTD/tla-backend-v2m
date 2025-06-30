import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { responseController } from '../controllers/lead.controller';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.createResponse,
);
router.get('/list', responseController.getAllResponse);
router.get(
  '/my',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.getMyAllResponse,
);
router.get(
  '/:responseId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.getSingleResponse,
);
router.delete(
  '/delete/:responseId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),

  responseController.deleteSingleResponse,
);
router.patch(
  '/edit/:responseId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),

  responseController.updateSingleResponse,
);

export const responseRouter = router;
