import { Router } from 'express';

import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';
import { countryRouter } from '../module/geo/Country/routes/country.route';
import { serviceRouter } from '../module/service/Service/routes/service.route';
import { stepsCountryWiseOptionGroupsMapRouter } from '../module/service/StepsCountryWiseOptionGroupsMap/routes/stepsCountryWiseOptionGroupsMap.route';
import { CountryWiseServiceMapRouter } from '../module/geo/CountryWiseServiceMap/routes/countryWiseServiceMap.route';
import { countryStepsOptionMapRouter } from '../module/geo/CountryStepsOptionMap/routes/countryStepsOptionMap.route';
import { OptionGroupRouter } from '../module/service/OptionGroup/routes/optionGroup.route';
import { OptionRouter } from '../module/service/Option/routes/option.route';

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
  {
    path: '/services',
    route: serviceRouter,
  },
  {
    path: '/steps_country_wise_service_wise_option_groups_map',
    route: stepsCountryWiseOptionGroupsMapRouter,
  },
  {
    path: '/country_wise_service_map',
    route: CountryWiseServiceMapRouter,
  },
  {
    path: '/country_steps_option_group-option-map',
    route: countryStepsOptionMapRouter,
  },
  {
    path: '/option_groups',
    route: OptionGroupRouter,
  },
  {
    path: '/options',
    route: OptionRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
