import { Router } from 'express';

import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';
import { countryRouter } from '../module/Geo/Country/routes/country.route';
import { serviceRouter } from '../module/Service/Service/routes/service.route';
import { OptionRouter } from '../module/Service/Option/routes/option.route';
import { CountryWiseMapRouter } from '../module/Geo/CountryWiseMap/routes/countryWiseMap.route';
import { questionRouter } from '../module/Service/Question/routes/ServiceWiseQuestion.route';
import { viewRouter } from '../module/View/routes/view.router';
import { leadServiceRouter } from '../module/Lead/routes/leadService.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/user',
    route: UserProfileRouter,
  },
  {
    path: '/country',
    route: countryRouter,
  },
  {
    path: '/service',
    route: serviceRouter,
  },
  {
    path: '/country-wise-map',
    route: CountryWiseMapRouter,
  },
  {
    path: '/question',
    route: questionRouter,
  },

  {
    path: '/option',
    route: OptionRouter,
  },
  {
    path: '/lead-services',
    route: leadServiceRouter,
  },
  {
    path: '/',
    route: viewRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
