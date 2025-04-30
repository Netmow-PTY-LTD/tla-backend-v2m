import { Router } from 'express';

import { serviceRouter } from './Service/service.route';
import { countryRouter } from './Country/country.route';

const superAdminRoute = Router();

const moduleRoutes = [
  {
    path: '/service',
    route: serviceRouter,
  },
  {
    path: '/country',
    route: countryRouter,
  },
];

moduleRoutes.forEach((route) => superAdminRoute.use(route.path, route.route));
export default superAdminRoute;
