import { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';


import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { categoryController } from '../controllers/category.controller';
import { categoryZodValidation } from '../validations/category.validation';

const router = Router();

router.post(
  '/add',
  // auth(USER_ROLE.ADMIN),
  validateRequest(categoryZodValidation.categoryValidationSchema),
  categoryController.createCategory,
);

router.get(
  '/list',
  categoryController.getAllCategory,
);
router.get('/:categoryId', categoryController.getSingleCategory);
router.delete('/delete/:categoryId', categoryController.deleteSingleCategory);
router.patch(
  '/edit/:categoryId',
  validateRequest(categoryZodValidation.updateServiceValidationSchema),
  categoryController.updateSingleCategory,
);

export const categoryRouter = router;
