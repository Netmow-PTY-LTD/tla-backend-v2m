import { NextFunction, Request, Response, Router } from 'express';
import { firmController } from './firm.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { upload } from '../../config/upload';

const router = Router();

router.get(
  '/firmInfo',
  firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
  firmController.getFirmInfo,
);

router.get(
  '/dashboard/stats',
  firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
  firmController.getFirmDasboardStats,
);

router.put(
  '/firmInfo/update',
  upload.single('companyLogo'),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
  firmController.updateFirmInfo,
);

router.get(
  '/dashboard/firmlawyers-case/stats',
  firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
  firmController.getFirmLawyerLeadStatsByDate,
);



export const firmRouter = router;

