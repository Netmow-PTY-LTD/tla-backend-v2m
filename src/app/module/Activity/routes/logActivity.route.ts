import { Router } from 'express';
import { activityLogController } from '../controllers/logActivity.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';


const router = Router();


router.get('/user', auth(USER_ROLE.ADMIN,USER_ROLE.USER), activityLogController.getUserActivityLogs);
router.post('/', auth(USER_ROLE.ADMIN,USER_ROLE.USER), activityLogController.createUserActivityLogs);
router.get('/lawyer-details/:lawyerId' , activityLogController.getLawyerDetailsLog);



export const activityLogRouter = router;
