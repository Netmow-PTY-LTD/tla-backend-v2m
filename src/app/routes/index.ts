import { Router } from 'express';

import adminRoute from '../module/Admin';
import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';

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
    path: '/users',
    route: UserProfileRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
