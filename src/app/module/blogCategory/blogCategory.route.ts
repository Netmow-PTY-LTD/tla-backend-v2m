import express from 'express';
import { blogCategoryController } from './blogCategory.controller';

const router = express.Router();

router.post('/add', blogCategoryController.createBlogCategory);
router.get('/list', blogCategoryController.getBlogCategories);
router.get('/:id', blogCategoryController.getBlogCategoryById);
router.patch('/:id/update', blogCategoryController.updateBlogCategory);
router.delete('/:id/delete', blogCategoryController.deleteBlogCategory);

export const blogCategoryRoutes = router;
