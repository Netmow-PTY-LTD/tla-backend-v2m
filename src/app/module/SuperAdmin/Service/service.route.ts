import { Router } from 'express';
import { serviceController } from './service.controller';
// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  serviceController.createService,
);

router.get('/', serviceController.getAllService);
router.get('/:serviceId', serviceController.getSingleService);
router.delete('/:serviceId', serviceController.deleteSingleService);
router.put('/:serviceId', serviceController.updateSingleService);

export const serviceRouter = router;
