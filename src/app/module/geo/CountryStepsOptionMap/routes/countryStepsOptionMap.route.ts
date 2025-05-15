import { Router } from 'express';
import { countryStepsOptionMapController } from '../controllers/countryStepsOptionMap.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/add',
  // validateRequest(),
  countryStepsOptionMapController.createCountryStepsOptionMap,
);
router.get(
  '/list',
  countryStepsOptionMapController.getAllCountryStepsOptionMap,
);
router.get(
  '/:countryStepsOptionMapId',
  countryStepsOptionMapController.getSingleCountryStepsOptionMap,
);
router.delete(
  '/delete/:countryStepsOptionMapId',
  countryStepsOptionMapController.deleteSingleCountryStepsOptionMap,
);
router.put(
  '/edit/:countryStepsOptionMapId',
  countryStepsOptionMapController.updateSingleCountryStepsOptionMap,
);

export const countryStepsOptionMapRouter = router;
