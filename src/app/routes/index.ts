import { Router } from 'express';

import { publicRouter } from '../module/Public';

import adminRoute from '../module/admin';
import { authRouter } from '../module/Auth/auth.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/public',
    route: publicRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
