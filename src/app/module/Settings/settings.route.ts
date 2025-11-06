
import { Router } from 'express';



import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { settingsController } from './settings.controller';
import { upload } from '../../config/upload';

const router = Router();

router.get('/',
    auth(USER_ROLE.ADMIN),
    settingsController.getAppSettings);
router.patch('/',
    auth(USER_ROLE.ADMIN),
    upload.fields([
        { name: 'appLogo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 },
    ]),
    settingsController.updateAppSettings);
router.post('/reset',
    auth(USER_ROLE.ADMIN),
    settingsController.resetAppSettings);


export const settingsRouter = router;
