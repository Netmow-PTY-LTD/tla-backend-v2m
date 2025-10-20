import { NextFunction, Request, Response, Router } from 'express';

import { upload } from '../../config/upload';
import { adminFirmController } from './firm.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = Router();


router.get('/list', auth(USER_ROLE.ADMIN), adminFirmController.listFirms);
router.post('/add', auth(USER_ROLE.ADMIN), adminFirmController.createFirm);
router.get('/:id', auth(USER_ROLE.ADMIN), adminFirmController.getFirmById);

router.put(
    '/:id/update',
    upload.single('companyLogo'),

    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },

    adminFirmController.updateFirm,
);


router.delete(
    '/:id/delete',
    auth(USER_ROLE.ADMIN),
    adminFirmController.deleteFirm,
);


router.patch(
    '/:id/status',
    auth(USER_ROLE.ADMIN),
    adminFirmController.firmStatus,
);


export const adminFirmRouter = router;
