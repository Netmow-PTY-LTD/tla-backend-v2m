import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { blogController } from './blog.controller';


const router = Router();

router.post('/add', auth(USER_ROLE.ADMIN), blogController.createBlog);
router.get('/list', blogController.getBlogs);
router.get('/:blogId', blogController.getBlogById);
router.put('/:blogId/update', auth(USER_ROLE.ADMIN), blogController.updateBlog);
router.delete('/:blogId/delete', auth(USER_ROLE.ADMIN), blogController.deleteBlog);

export const blogRouter = router;
