import { Router } from 'express';
import { staffController } from './staff.controller';
import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';

const router = Router();

router.post('/add', firmAuth(Firm_USER_ROLE.FIRM), staffController.createStaff);

// GET staff list
router.get('/:firmId/list', staffController.listStaff);

// GET staff by id
router.get('/:firmId/:staffId', staffController.getStaffById);

// PUT update staff
router.put('/:firmId/:staffId/update', staffController.updateStaff);

// DELETE staff
router.delete('/:firmId/:staffId/delete', staffController.deleteStaff);

export const staffRoutes = router;
