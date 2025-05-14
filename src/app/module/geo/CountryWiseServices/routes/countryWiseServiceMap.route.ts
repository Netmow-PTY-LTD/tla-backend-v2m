import { Router } from 'express';
import { countryWiseServiceController } from '../controllers/countryWiseService.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  countryWiseServiceController.createCountryWiseService,
);
router.get('/', countryWiseServiceController.getAllCountryWiseService);
router.get(
  '/:countryWiseServiceId',
  countryWiseServiceController.getSingleCountryWiseService,
);
router.delete(
  '/:countryWiseServiceId',
  countryWiseServiceController.deleteSingleCountryWiseService,
);
router.put(
  '/:countryWiseServiceId',
  countryWiseServiceController.updateSingleCountryWiseService,
);

export const CountryWiseServiceRouter = router;
