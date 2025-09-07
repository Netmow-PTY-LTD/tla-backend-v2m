import { Router } from 'express';
import { optionController } from './option.controller';
import validateRequest from '../../middlewares/validateRequest';
import { OptionZodValidation } from './option.validation';

const router = Router();

router.post(
  '/add',
  validateRequest(OptionZodValidation.OptionZodSchema),
  optionController.createOption,
);
router.get('/list', optionController.getAllOption);
router.get('/:optionId', optionController.getSingleOption);
router.delete('/delete/:optionId', optionController.deleteSingleOption);
router.patch('/edit/:optionId', optionController.updateSingleOption);

export const OptionRouter = router;
