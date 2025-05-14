import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { countryZodValidation } from '../validations/country.validation';
import { countryController } from '../controllers/country.controller';
import auth from '../../../../middlewares/auth';

const router = Router();

router.post(
  '/',

  validateRequest(countryZodValidation.countryZodValidationSchema),
  countryController.createCountry,
);
router.get('/', countryController.getAllCountry);
router.get('/:countryId', countryController.getSingleCountry);
router.delete('/:countryId', countryController.deleteSingleCountry);
router.patch(
  '/:countryId',
  validateRequest(countryZodValidation.updateCountryZodValidationSchema),
  countryController.updateSingleCountry,
);

export const countryRouter = router;
