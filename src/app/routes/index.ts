import { Router } from 'express';
import superAdminRoute from '../module/super-admin';

const router = Router();

const moduleRoutes = [
  {
    path: '/super-admin',
    route: superAdminRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
