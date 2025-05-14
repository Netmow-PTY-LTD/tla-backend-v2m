import { Router } from 'express';
import { optionController } from '../controllers/option.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { OptionZodValidation } from '../validations/option.validation';

const router = Router();

router.post(
  '/',
  validateRequest(OptionZodValidation.OptionZodSchema),
  optionController.createOption,
);
router.get('/', optionController.getAllOption);
router.get('/:optionId', optionController.getSingleOption);
router.delete('/:optionId', optionController.deleteSingleOption);
router.put('/:optionId', optionController.updateSingleOption);

export const OptionRouter = router;
