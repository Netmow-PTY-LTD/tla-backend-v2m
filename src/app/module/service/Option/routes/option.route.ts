import { Router } from 'express';
import { optionController } from '../controllers/option.controller';

const router = Router();

router.post(
  '/',
  // validateRequest(),
  optionController.createOption,
);
router.get('/', optionController.getAllOption);
router.get('/:optionId', optionController.getSingleOption);
router.delete('/:optionId', optionController.deleteSingleOption);
router.put('/:optionId', optionController.updateSingleOption);

export const OptionRouter = router;
