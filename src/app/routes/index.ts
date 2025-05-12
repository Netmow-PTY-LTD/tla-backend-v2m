import { Router } from 'express';

import adminRoute from '../module/Admin';
import { authRouter } from '../module/Auth/auth.route';
import { UserProfileRouter } from '../module/User/user.route';

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
    path: '/user',
    route: UserProfileRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
