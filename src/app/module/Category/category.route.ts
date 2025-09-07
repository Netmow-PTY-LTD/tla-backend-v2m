import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';


import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { categoryController } from './category.controller';
import { categoryZodValidation } from './category.validation';
import { upload } from '../../config/upload';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(categoryZodValidation.categoryValidationSchema),
  categoryController.createCategory,
);

router.get(
  '/list',
  categoryController.getAllCategory,
);
router.get(
  '/public',
  categoryController.getAllCategoryPublic,
);
router.get('/:categoryId', categoryController.getSingleCategory);
router.delete('/delete/:categoryId', categoryController.deleteSingleCategory);
router.patch(
  '/edit/:categoryId',
  auth(USER_ROLE.ADMIN),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(categoryZodValidation.updateCategoryValidationSchema),
  categoryController.updateSingleCategory,
);

export const categoryRouter = router;
