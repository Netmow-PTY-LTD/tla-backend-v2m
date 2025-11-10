import express from 'express';
import { headerFooterCodeController } from './headerFooterCode.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';


const router = express.Router();

router.post('/add', auth(USER_ROLE.ADMIN), headerFooterCodeController.createCode);
router.get('/list', headerFooterCodeController.getCodes);
router.get('/:id', headerFooterCodeController.getCodeById);
router.patch('/:id/update', auth(USER_ROLE.ADMIN), headerFooterCodeController.updateCode);
router.delete('/:id/delete', auth(USER_ROLE.ADMIN), headerFooterCodeController.deleteCode);

// Public endpoint for landing page (no pagination)
router.get('/public/header-footer', headerFooterCodeController.getAllCodesPublic);

export const headerFooterCodeRoutes = router;
