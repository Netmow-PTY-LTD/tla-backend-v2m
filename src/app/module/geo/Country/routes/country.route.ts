import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { countryZodValidation } from '../validations/country.validation';
import { countryController } from '../controllers/country.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLE } from '../../../../constant';
import { zipcodeZodValidation } from '../validations/zipcode.validation';
import { zipCodeController } from '../controllers/zipcode.controller';
import { rangeZodValidation } from '../validations/range.validation';
import { rangeController } from '../controllers/range.controller';

const router = Router();

// country dedicated end point
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

//  zip code dedicated end point
router.post(
  '/zipcode/add',
  auth(USER_ROLE.ADMIN),
  validateRequest(zipcodeZodValidation.zipcodeZodValidationSchema),
  zipCodeController.createZipCode,
);
router.get(
  '/zipcode/list',

  zipCodeController.getAllZipCode,
);
router.get(
  '/zipcode/:zipcodeId',
  auth(USER_ROLE.ADMIN),
  zipCodeController.getSingleZipCode,
);
router.delete(
  '/zipcode/delete/:zipcodeId',
  auth(USER_ROLE.ADMIN),

  zipCodeController.deleteSingleZipCode,
);
router.patch(
  '/zipcode/edit/:zipcodeId',
  auth(USER_ROLE.ADMIN),
  validateRequest(zipcodeZodValidation.updateZipcodeZodValidationSchema),
  zipCodeController.updateSingleZipCode,
);

// Range dedicated end point

router.post(
  '/zipcode/range/add',
  auth(USER_ROLE.ADMIN),
  validateRequest(rangeZodValidation.rangeZodValidationSchema),
  rangeController.createRange,
);
router.get('/zipcode/range/list', rangeController.getAllRange);
router.get(
  '/zipcode/range/:rangeId',
  auth(USER_ROLE.ADMIN),
  rangeController.getSingleRange,
);
router.delete(
  '/zipcode/range/delete/:rangeId',
  auth(USER_ROLE.ADMIN),

  rangeController.deleteSingleRange,
);
router.patch(
  '/zipcode/range/edit/:rangeId',
  auth(USER_ROLE.ADMIN),
  validateRequest(rangeZodValidation.updateRangeZodValidationSchema),
  rangeController.updateSingleRange,
);

export const countryRouter = router;
