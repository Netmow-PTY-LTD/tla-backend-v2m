import { Router } from 'express';

import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';
import { countryRouter } from '../module/Geo/Country/routes/country.route';
import { serviceRouter } from '../module/Service/Service/routes/service.route';

// import { countryStepsOptionMapRouter } from '../module/Geo/CountryStepsOptionMap/routes/countryStepsOptionMap.route';
// import { OptionGroupRouter } from '../module/Service/OptionGroup/routes/optionGroup.route';
import { OptionRouter } from '../module/Service/Option/routes/option.route';
import { CountryWiseServiceRouter } from '../module/Geo/CountryWiseServices/routes/countryWiseService.route';
import { ServiceWiseQuestionRouter } from '../module/Service/ServiceWiseQuestion/routes/ServiceWiseQuestion.route';

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
    path: '/country-wise-service',
    route: CountryWiseServiceRouter,
  },
  {
    path: '/service-wise-question',
    route: ServiceWiseQuestionRouter,
  },
  {
    path: '/option',
    route: OptionRouter,
  },
  // {
  //   path: '/steps_country_wise_service_wise_option_groups_map',
  //   route: stepsCountryWiseOptionGroupsMapRouter,
  // },

  // {
  //   path: '/country_steps_option_group-option-map',
  //   route: countryStepsOptionMapRouter,
  // },
  // {
  //   path: '/option_groups',
  //   route: OptionGroupRouter,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
