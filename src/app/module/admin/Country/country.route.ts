import { Router } from 'express';
import { countryController } from './country.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  countryController.createCountry,
);
router.get('/', countryController.getAllCountry);
router.get('/:countryId', countryController.getSingleCountry);
router.delete('/:countryId', countryController.deleteSingleCountry);
router.put('/:countryId', countryController.updateSingleCountry);

export const countryRouter = router;
