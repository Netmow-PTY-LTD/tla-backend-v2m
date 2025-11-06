import { NextFunction, Request, Response, Router } from 'express';
import { seoController } from './seo.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { upload } from '../../config/upload';

const router = Router();

router.post('/add', upload.single('metaImage'), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, auth(USER_ROLE.ADMIN), seoController.createSeo);
router.get('/list', seoController.getAllSeo);
router.get('/:seoId', seoController.getSingleSeo);
router.patch('/:seoId/update', upload.single('metaImage'), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, auth(USER_ROLE.ADMIN), seoController.updateSeo);
router.delete('/:seoId/delete', auth(USER_ROLE.ADMIN), seoController.deleteSeo);

//  public api

router.get('/by-slug/:slug', seoController.getSingleSeoBySlug);



export const seoRouter = router;