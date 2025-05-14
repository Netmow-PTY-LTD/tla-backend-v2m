import { Router } from 'express';
import { countryWiseServiceController } from '../controllers/countryWiseService.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { CountryWiseServiceZodValidation } from '../validations/countryWiseService.validation';

const router = Router();

router.post(
  '/',
  validateRequest(
    CountryWiseServiceZodValidation.createCountryWiseServiceSchema,
  ),
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
router.patch(
  '/:countryWiseServiceId',
  validateRequest(
    CountryWiseServiceZodValidation.createCountryWiseServiceSchema,
  ),
  countryWiseServiceController.updateSingleCountryWiseService,
);

export const CountryWiseServiceRouter = router;
