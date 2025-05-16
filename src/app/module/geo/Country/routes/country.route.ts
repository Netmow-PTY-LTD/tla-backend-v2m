import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { countryZodValidation } from '../validations/country.validation';
import { countryController } from '../controllers/country.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLE } from '../../../../constant';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN),
  validateRequest(countryZodValidation.countryZodValidationSchema),
  countryController.createCountry,
);
router.get('/list', auth(USER_ROLE.ADMIN), countryController.getAllCountry);
router.get(
  '/:countryId',
  auth(USER_ROLE.ADMIN),
  countryController.getSingleCountry,
);
router.delete(
  '/delete/:countryId',
  auth(USER_ROLE.ADMIN),

  countryController.deleteSingleCountry,
);
router.patch(
  '/edit/:countryId',
  auth(USER_ROLE.ADMIN),
  validateRequest(countryZodValidation.updateCountryZodValidationSchema),
  countryController.updateSingleCountry,
);

export const countryRouter = router;
