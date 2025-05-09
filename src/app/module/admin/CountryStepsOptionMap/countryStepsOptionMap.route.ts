import { Router } from 'express';
import { countryStepsOptionMapController } from './countryStepsOptionMap.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  countryStepsOptionMapController.createCountryStepsOptionMap,
);
router.get('/', countryStepsOptionMapController.getAllCountryStepsOptionMap);
router.get(
  '/:countryStepsOptionMapId',
  countryStepsOptionMapController.getSingleCountryStepsOptionMap,
);
router.delete(
  '/:countryStepsOptionMapId',
  countryStepsOptionMapController.deleteSingleCountryStepsOptionMap,
);
router.put(
  '/:countryStepsOptionMapId',
  countryStepsOptionMapController.updateSingleCountryStepsOptionMap,
);

export const countryStepsOptionMapRouter = router;
