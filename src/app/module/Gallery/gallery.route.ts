import { NextFunction, Request, Response, Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { galleryController } from './gallery.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createGalleryZod, updateGalleryZod } from './gallery.validation';
import { upload } from '../../config/upload';

const router = Router();

// Public
router.get('/list', galleryController.getGalleries);
router.get('/:galleryId', galleryController.getGalleryById);

// Protected - admin only
router.post('/add', auth(USER_ROLE.ADMIN), upload.single('galleryImage'), validateRequest(createGalleryZod), galleryController.createGallery);
router.put('/:galleryId/update', auth(USER_ROLE.ADMIN), upload.single('galleryImage'), validateRequest(updateGalleryZod), galleryController.updateGallery);
router.delete('/:galleryId/delete', auth(USER_ROLE.ADMIN), galleryController.deleteGallery);

export const galleryRouter = router;

