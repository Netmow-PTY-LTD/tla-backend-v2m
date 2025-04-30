import { Router } from 'express';
import { optionGroupController } from './optionGroup.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  optionGroupController.createOptionGroup,
);
router.get('/', optionGroupController.getAllOptionGroup);
router.get('/:optionGroupId', optionGroupController.getSingleOptionGroup);
router.delete('/:optionGroupId', optionGroupController.deleteSingleOptionGroup);
router.put('/:optionGroupId', optionGroupController.updateSingleOptionGroup);

export const OptionGroupRouter = router;
