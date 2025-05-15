import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { countryZodValidation } from '../validations/country.validation';
import { countryController } from '../controllers/country.controller';

const router = Router();

router.post(
  '/add',

  validateRequest(countryZodValidation.countryZodValidationSchema),
  countryController.createCountry,
);
router.get('/list', countryController.getAllCountry);
router.get('/:countryId', countryController.getSingleCountry);
router.delete('/delete/:countryId', countryController.deleteSingleCountry);
router.patch(
  '/edit/:countryId',
  validateRequest(countryZodValidation.updateCountryZodValidationSchema),
  countryController.updateSingleCountry,
);

export const countryRouter = router;
