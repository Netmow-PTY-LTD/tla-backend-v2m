import { Router } from 'express';
import { stepsCountryWiseOptionGroupsMapController } from './stepsCountryWiseOptionGroupsMap.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  stepsCountryWiseOptionGroupsMapController.createStepsCountryWiseOptionGroupsMap,
);
router.get(
  '/',
  stepsCountryWiseOptionGroupsMapController.getAllStepsCountryWiseOptionGroupsMap,
);
router.get(
  '/:stepsCountryWiseOptionGroupsMapId',
  stepsCountryWiseOptionGroupsMapController.getSingleStepsCountryWiseOptionGroupsMap,
);
router.delete(
  '/:stepsCountryWiseOptionGroupsMapId',
  stepsCountryWiseOptionGroupsMapController.deleteSingleStepsCountryWiseOptionGroupsMap,
);
router.put(
  '/:stepsCountryWiseOptionGroupsMapId',
  stepsCountryWiseOptionGroupsMapController.updateSingleStepsCountryWiseOptionGroupsMap,
);

export const stepsCountryWiseOptionGroupsMapRouter = router;
