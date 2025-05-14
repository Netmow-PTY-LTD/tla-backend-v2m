import { Router } from 'express';

import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';
import { countryRouter } from '../module/geo/Country/country.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/users',
    route: UserProfileRouter,
  },
  {
    path: '/countries',
    route: countryRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
