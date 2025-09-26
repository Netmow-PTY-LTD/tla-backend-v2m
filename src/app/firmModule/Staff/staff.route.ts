import { Router } from 'express';
import { staffController } from './staff.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';

const router = Router();


router.post('/add', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.createStaff);
// GET staff list
router.get('/list', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.listStaff);

// GET staff by id
router.get('/:staffUserId', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.getStaffById);

// PUT update staff
router.put('/:staffUserId/update',firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.updateStaff);

// DELETE staff
router.delete('/:staffUserId/delete', firmAuth(Firm_USER_ROLE.ADMIN), staffController.deleteStaff);



export const staffRoutes = router;
