import { NextFunction, Request, Response, Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { blogController } from './blog.controller';
import { upload } from '../../config/upload';


const router = Router();

router.get('/recent', blogController.getRecentBlogs);
router.post('/add', auth(USER_ROLE.ADMIN), upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'metaImage', maxCount: 1 },
]), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, blogController.createBlog);
router.get('/list', blogController.getBlogs);
router.get('/:slug', blogController.getBlogById);
router.put('/:blogId/update', auth(USER_ROLE.ADMIN), upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'metaImage', maxCount: 1 },
]), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, blogController.updateBlog);
router.delete('/:blogId/delete', auth(USER_ROLE.ADMIN), blogController.deleteBlog);


export const blogRouter = router;
