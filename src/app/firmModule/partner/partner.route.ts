import { NextFunction, Request, Response, Router } from 'express';
import { partnerController } from './partner.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { upload } from '../../config/upload';

const router = Router();

// All routes require firm role
router.use(firmAuth(Firm_USER_ROLE.FIRM));

router.post(
  '/add',
  upload.single('partnerImage'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },

  partnerController.createPartner,
);
router.get('/:firmId/list', partnerController.listPartners);
router.put(
  '/:firmId/:partnerId/update',
  upload.single('partnerImage'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },

  partnerController.updatePartner,
);
router.delete('/:firmId/:partnerId/delete', partnerController.deletePartner);
//router.delete('/:partnerId', partnerController.deletePartner);
router.get('/:firmId/:partnerId', partnerController.getSinglePartner);

export const partnerRouter = router;
