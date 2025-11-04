import express from 'express';
import { blogCategoryController } from './blogCategory.controller';

const router = express.Router();

router.post('/', blogCategoryController.createBlogCategory);
router.get('/', blogCategoryController.getBlogCategories);
router.get('/:id', blogCategoryController.getBlogCategoryById);
router.patch('/:id', blogCategoryController.updateBlogCategory);
router.delete('/:id', blogCategoryController.deleteBlogCategory);

export const blogCategoryRoutes = router;
