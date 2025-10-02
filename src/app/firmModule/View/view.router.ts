import { Router } from 'express';
import { viewController } from './view.controller';



const router = Router();


router.get(
  '/public/firm/by-slug/:slug',
  viewController.getSingleFirmProfileBySlug,
);







export const firmViewRouter = router;
