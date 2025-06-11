import { Router } from 'express';

import validateRequest from '../../../../middlewares/validateRequest';
import { CountryWiseMapZodValidation } from '../validations/countryWiseService.validation';
import { countryWiseMapController } from '../controllers/countryWiseMap.controller';

const router = Router();

router.post(
  '/add',
  validateRequest(CountryWiseMapZodValidation.createCountryWiseMapSchema),
  countryWiseMapController.createCountryWiseMap,
);
router.get('/list', countryWiseMapController.getAllCountryWiseMap);
router.get(
  '/:countryWiseMapId',
  countryWiseMapController.getSingleCountryWiseMap,
);
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
router.patch('/manage-service', countryWiseMapController.manageService);

export const CountryWiseMapRouter = router;
