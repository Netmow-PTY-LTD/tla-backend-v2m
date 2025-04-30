import { Router } from 'express';

import { serviceRouter } from './Service/service.route';
import { countryRouter } from './Country/country.route';
import { stepsCountryWiseOptionGroupsMapRouter } from './StepsCountryWiseOptionGroupsMap/stepsCountryWiseOptionGroupsMap.route';
import { CountryWiseServiceMapRouter } from './CountryWiseServiceMap/countryWiseServiceMap.route';
import { countryStepsOptionMapRouter } from './CountryStepsOptionMap/countryStepsOptionMap.route';
import { OptionGroupRouter } from './OptionGroup/optionGroup.route';
import { OptionRouter } from './Option/option.route';

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

moduleRoutes.forEach((route) => superAdminRoute.use(route.path, route.route));
export default superAdminRoute;
