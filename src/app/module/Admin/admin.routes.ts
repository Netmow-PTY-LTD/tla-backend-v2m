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

// Custom service search: all standalone search logs (paginated + top terms)
router.get("/custom-service-searches", auth(USER_ROLE.ADMIN), adminController.getCustomServiceSearches);

// Custom service search: registration drafts that contain a customService value
router.get("/custom-service-drafts", auth(USER_ROLE.ADMIN), adminController.getCustomServiceDrafts);






// router.get("/client/:clientId", adminController.getClientDashboard);

// // Lawyer dashboard data
// router.get("/lawyer/:lawyerId", adminController.getLawyerDashboard);




export const adminRouter = router;
