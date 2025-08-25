import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { visitorTrackerController } from '../controllers/visitorTracker.controller';



const router = Router();

router.post("/visit", visitorTrackerController.trackVisit);
router.get("/recent", visitorTrackerController.getRecentVisitors);

export default router;








export const visitorTrackerRouter = router;
