import { Router } from 'express';
import superAdminRoute from '../module/SuperAdmin';
import { publicRouter } from '../module/Public';
import { AuthRouter } from '../module/Auth/auth.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/super-admin',
    route: superAdminRoute,
  },
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/public',
    route: publicRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
