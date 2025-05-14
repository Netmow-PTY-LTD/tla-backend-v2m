import { Router } from 'express';
import { countryWiseServiceMapController } from '../controllers/countryWiseServiceMap.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  countryWiseServiceMapController.createCountryWiseServiceMap,
);
router.get('/', countryWiseServiceMapController.getAllCountryWiseServiceMap);
router.get(
  '/:countryWiseServiceMapId',
  countryWiseServiceMapController.getSingleCountryWiseServiceMap,
);
router.delete(
  '/:countryWiseServiceMapId',
  countryWiseServiceMapController.deleteSingleCountryWiseServiceMap,
);
router.put(
  '/:countryWiseServiceMapId',
  countryWiseServiceMapController.updateSingleCountryWiseServiceMap,
);

export const CountryWiseServiceMapRouter = router;
