import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { leadController } from '../controllers/lead.controller';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadController.createLead,
);
router.get('/list', leadController.getAllLead);
router.get(
  '/my',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadController.getMyAllLead,
);
router.get(
  '/:leadId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadController.getSingleLead,
);
router.delete(
  '/delete/:leadId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),

  leadController.deleteSingleLead,
);
router.patch(
  '/edit/:leadId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),

  leadController.updateSingleLead,
);

export const leadRouter = router;
