import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { responseController } from '../controllers/response.controller';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.createResponse,
);
router.get('/list', responseController.getAllResponse);
// lead wise response
router.get('/lead-wise/:leadId', auth(USER_ROLE.ADMIN, USER_ROLE.USER), responseController.getAllResponseLeadWise);
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

// status update
router.patch(
  '/:responseId/status',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.updateResponseStatus,
);


// hired request and hired status update


// Client or lawyer sends hire request
router.patch("/:responseId/request-hire", auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.updateResponseStatus,
);

// Lawyer accepts or rejects hire request
router.patch("/:responseId/hire-status", auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  responseController.updateResponseStatus,);

export const responseRouter = router;
