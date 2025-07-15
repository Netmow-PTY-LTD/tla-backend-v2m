
import { Router } from 'express';



import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/',
    auth(USER_ROLE.ADMIN),
    settingsController.getAppSettings);
router.patch('/',
    auth(USER_ROLE.ADMIN),
    settingsController.updateAppSettings);
router.post('/reset',
    auth(USER_ROLE.ADMIN),
    settingsController.resetAppSettings);


export const settingsRouter = router;
