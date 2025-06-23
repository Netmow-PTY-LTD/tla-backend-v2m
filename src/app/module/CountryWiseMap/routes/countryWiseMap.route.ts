import { Router } from 'express';

import validateRequest from '../../../middlewares/validateRequest';
import { CountryWiseMapZodValidation } from '../validations/countryWiseService.validation';
import { countryWiseMapController } from '../controllers/countryWiseMap.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { upload } from '../../../config/upload';

const router = Router();

router.post(
  '/add',
  validateRequest(CountryWiseMapZodValidation.createCountryWiseMapSchema),
  countryWiseMapController.createCountryWiseMap,
);
router.get('/list', countryWiseMapController.getAllCountryWiseMap);

router.get(
  '/country/:countryId',
  countryWiseMapController.getSingleCountryWiseMapById,
);
router.delete(
  '/delete/:countryWiseMapId',
  countryWiseMapController.deleteSingleCountryWiseMap,
);
router.patch(
  '/edit/:countryId',
  validateRequest(CountryWiseMapZodValidation.createCountryWiseMapSchema),
  countryWiseMapController.updateSingleCountryWiseMap,
);

router.get(
  '/manage-service',
  countryWiseMapController.getAllCountryServiceField,
);

router.get(
  '/:countryWiseMapId',
  countryWiseMapController.getSingleCountryWiseMap,
);
router.patch(
  '/manage-service',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  upload.any(),

  countryWiseMapController.manageService,
);

export const CountryWiseMapRouter = router;
