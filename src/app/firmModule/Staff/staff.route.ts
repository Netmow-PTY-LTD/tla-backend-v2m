import { NextFunction, Request, Response, Router } from 'express';
import { staffController } from './staff.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { upload } from '../../config/upload';

const router = Router();


router.post(
    '/add',
    upload.single('image'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
    staffController.createStaff
);


// GET staff list
router.get('/list', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), staffController.listStaff);

// GET staff by id
router.get('/:staffUserId', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), staffController.getStaffById);

// PUT update staff
router.put('/:staffUserId/update',
    upload.single('image'),

    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    firmAuth(Firm_USER_ROLE.STAFF, Firm_USER_ROLE.ADMIN),
    staffController.updateStaff);

// DELETE staff
router.delete('/:staffUserId/delete', firmAuth(Firm_USER_ROLE.ADMIN), staffController.deleteStaff);



export const staffRoutes = router;
