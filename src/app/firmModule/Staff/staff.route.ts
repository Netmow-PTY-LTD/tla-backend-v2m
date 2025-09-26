import { Router } from 'express';
import { staffController } from './staff.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';

const router = Router();

router.post('/add', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.createStaff);

// GET staff list
router.get('/list', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.listStaff);

// GET staff by id
router.get('/:staffId', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.getStaffById);

// PUT update staff
router.put('/:staffId/update',firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.updateStaff);

// DELETE staff
router.delete('/:staffId/delete', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.FIRM, Firm_USER_ROLE.STAFF), staffController.deleteStaff);

export const staffRoutes = router;
