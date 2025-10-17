import { NextFunction, Request, Response, Router } from 'express';
import { viewController } from './view.controller';
import { upload } from '../../config/upload';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';



const router = Router();


router.get(
  '/public/firm/by-slug/:slug',
  viewController.getSingleFirmProfileBySlug,
);



router.post(
  '/public/check-firm-name',
  viewController.checkFirmName
);

  
router.get(
  '/public/firm/by-search',
  viewController.getAllFirm
);



router.post("/public/claim", upload.array("proofOwnFiles"), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, viewController.createClaimRequest);



router.get(
  '/lawyer-notifications',
  firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.LAWYER, Firm_USER_ROLE.STAFF),
  viewController.getAllFirmLawyerNotification
);



export const firmViewRouter = router;
