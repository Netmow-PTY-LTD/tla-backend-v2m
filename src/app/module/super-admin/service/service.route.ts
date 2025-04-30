import { Router } from 'express';
import { serviceController } from './service.controller';
// import validateRequest from '../../../middlewares/validateRequest';

const serviceRouter = Router();

serviceRouter.post(
  '/',
  // validateRequest(),
  serviceController.createService,
);

export default serviceRouter;
