import { Router } from 'express';
import { viewController } from './view.controller';



const router = Router();


router.get(
  '/public/firm/by-slug/:slug',
  viewController.getSingleFirmProfileBySlug,
);



router.post(
  '/public/check-firm-name',
  viewController.checkFirmName
);






export const firmViewRouter = router;
