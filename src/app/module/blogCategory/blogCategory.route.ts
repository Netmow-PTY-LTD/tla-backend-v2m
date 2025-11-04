import express from 'express';
import { blogCategoryController } from './blogCategory.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = express.Router();

router.post('/add',auth(USER_ROLE.ADMIN), blogCategoryController.createBlogCategory);
router.get('/list', blogCategoryController.getBlogCategories);
router.get('/:id', blogCategoryController.getBlogCategoryById);
router.patch('/:id/update', auth(USER_ROLE.ADMIN),blogCategoryController.updateBlogCategory);
router.delete('/:id/delete',auth(USER_ROLE.ADMIN), blogCategoryController.deleteBlogCategory);

export const blogCategoryRoutes = router;
