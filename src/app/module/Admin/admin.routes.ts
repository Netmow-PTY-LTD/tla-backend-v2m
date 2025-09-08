import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { adminController } from './admin.controller';


const router = Router();






router.get("/client/all", auth(USER_ROLE.ADMIN), adminController.getAllClientsDashboard);
router.get("/lawyer/all", auth(USER_ROLE.ADMIN), adminController.getAllLawyerDashboard);
router.get("/dashboard/chart", auth(USER_ROLE.ADMIN), adminController.getAdminDashboardChart);
router.get("/dashboard/stats", auth(USER_ROLE.ADMIN), adminController.getAdminDashboardStats);
router.get("/dashboard/bar-chart", auth(USER_ROLE.ADMIN), adminController.getAdminDashboardBarChart);






// router.get("/client/:clientId", adminController.getClientDashboard);

// // Lawyer dashboard data
// router.get("/lawyer/:lawyerId", adminController.getLawyerDashboard);




export const adminRouter = router;
