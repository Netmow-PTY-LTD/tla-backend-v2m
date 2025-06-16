import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { leadController } from '../controllers/lead.controller';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN),

  leadController.createLead,
);
router.get('/list', leadController.getAllLead);
router.get('/:leadId', auth(USER_ROLE.ADMIN), leadController.getSingleLead);
router.delete(
  '/delete/:leadId',
  auth(USER_ROLE.ADMIN),

  leadController.deleteSingleLead,
);
router.patch(
  '/edit/:leadId',
  auth(USER_ROLE.ADMIN),

  leadController.updateSingleLead,
);

export const countryRouter = router;
