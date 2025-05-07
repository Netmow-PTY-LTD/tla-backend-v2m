import { Router } from 'express';
import { authController } from './auth.controller';
// import validateRequest from '../../../middlewares/validateRequest';
const router = Router();

router.post(
  '/login',
  // validateRequest(),
  authController.login,
);

export const AuthRouter = router;
