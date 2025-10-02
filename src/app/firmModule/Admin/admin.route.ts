import { NextFunction, Request, Response, Router } from 'express';
import { adminController } from './admin.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { upload } from '../../config/upload';

const router = Router();



// CREATE admin
router.post(
    '/add',
    upload.single('image'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    firmAuth(Firm_USER_ROLE.ADMIN),
    adminController.createAdmin
);



// GET admin list
router.get('/list', firmAuth(Firm_USER_ROLE.ADMIN), adminController.listAdmins);

// GET admin by id
router.get('/:adminUserId', firmAuth(Firm_USER_ROLE.ADMIN), adminController.getAdminById);

// UPDATE admin
router.put('/:adminUserId/update',
    upload.single('image'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    firmAuth(Firm_USER_ROLE.ADMIN),
    adminController.updateAdmin
);

// DELETE admin
router.delete('/:adminUserId/delete', firmAuth(Firm_USER_ROLE.ADMIN), adminController.deleteAdmin);



export const adminRoutes = router;
