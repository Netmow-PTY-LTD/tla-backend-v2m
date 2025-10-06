import { NextFunction, Request, Response, Router } from 'express';
import { viewController } from './view.controller';
import { upload } from '../../config/upload';



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



export const firmViewRouter = router;
