import { Router } from 'express';
import { optionController } from '../controllers/option.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { OptionZodValidation } from '../validations/option.validation';

const router = Router();

router.post(
  '/create',
  validateRequest(OptionZodValidation.OptionZodSchema),
  optionController.createOption,
);
router.get('/all', optionController.getAllOption);
router.get('/single/:optionId', optionController.getSingleOption);
router.delete('/delete/:optionId', optionController.deleteSingleOption);
router.patch('/edit/:optionId', optionController.updateSingleOption);

export const OptionRouter = router;
