import { NextFunction, Request, Response, Router } from 'express';
import { FirmMediaController } from './media.controller';
import { upload } from '../../config/upload';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';


const router = Router();

//  Get all media (photos + videos) for logged-in firm
router.get(
  '/',
 firmAuth(Firm_USER_ROLE.FIRM), // restrict to firm role
  FirmMediaController.getFirmMedia,
);

//  Update media (upload photos + optional video URL)
router.patch(
  '/update',
 firmAuth(Firm_USER_ROLE.FIRM),
  upload.array('photos'), // multiple file uploads
   (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
  FirmMediaController.updateFirmMedia,
);

//  Remove specific photo or video
router.delete(
  '/remove',
 firmAuth(Firm_USER_ROLE.FIRM),
  FirmMediaController.removeFirmMedia,
);

export const FirmMediaRoutes = router;
