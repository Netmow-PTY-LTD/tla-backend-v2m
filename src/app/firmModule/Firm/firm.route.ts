import { NextFunction, Request, Response, Router } from 'express';
import { firmController } from './firm.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { upload } from '../../config/upload';

const router = Router();

router.get(
  '/firmInfo',
  firmAuth(Firm_USER_ROLE.STAFF,Firm_USER_ROLE.ADMIN),
  firmController.getFirmInfo,
);

router.put(
  '/firmInfo/update',
  upload.single('companyLogo'),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  firmAuth(Firm_USER_ROLE.STAFF,Firm_USER_ROLE.ADMIN),
  firmController.updateFirmInfo,
);

// Admin  Firm Management Endpoints

router.post('/', firmAuth(Firm_USER_ROLE.ADMIN), firmController.createFirm);
router.get('/', firmAuth(Firm_USER_ROLE.ADMIN), firmController.listFirms);
router.get('/:id', firmController.getFirmById);
router.put('/:id', firmAuth(Firm_USER_ROLE.ADMIN), firmController.updateFirm);
router.delete(
  '/firms/:id',
  firmAuth(Firm_USER_ROLE.ADMIN),
  firmController.deleteFirm,
);

export const firmRouter = router;

