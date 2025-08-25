import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { visitorTrackerController } from '../controllers/visitorTracker.controller';



const router = Router();

router.post("/visit", auth(USER_ROLE.ADMIN,USER_ROLE.USER), visitorTrackerController.trackVisit);
router.get("/recent", auth(USER_ROLE.ADMIN,USER_ROLE.USER), visitorTrackerController.getRecentVisitors);

export default router;








export const visitorTrackerRouter = router;
