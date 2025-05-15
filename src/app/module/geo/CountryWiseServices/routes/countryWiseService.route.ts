import { Router } from 'express';
import { countryWiseServiceController } from '../controllers/countryWiseService.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { CountryWiseServiceZodValidation } from '../validations/countryWiseService.validation';

const router = Router();

router.post(
  '/create',
  validateRequest(
    CountryWiseServiceZodValidation.createCountryWiseServiceSchema,
  ),
  countryWiseServiceController.createCountryWiseService,
);
router.get('/all', countryWiseServiceController.getAllCountryWiseService);
router.get(
  '/single/:countryWiseServiceId',
  countryWiseServiceController.getSingleCountryWiseService,
);
router.delete(
  '/delete/:countryWiseServiceId',
  countryWiseServiceController.deleteSingleCountryWiseService,
);
router.patch(
  '/edit/:countryWiseServiceId',
  validateRequest(
    CountryWiseServiceZodValidation.createCountryWiseServiceSchema,
  ),
  countryWiseServiceController.updateSingleCountryWiseService,
);

export const CountryWiseServiceRouter = router;
