import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CountryWiseMapZodValidation } from './countryWiseService.validation';
import { countryWiseMapController } from './countryWiseMap.controller';
import { USER_ROLE } from '../../constant';
import { upload } from '../../config/upload';
import auth from '../../middlewares/auth';



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

router.get(
  '/service-group',
  countryWiseMapController.getSingleCountryWiseServiceGroupMapById,
);



export const CountryWiseMapRouter = router;
