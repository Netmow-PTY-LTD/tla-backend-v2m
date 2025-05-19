"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../module/Auth/routes/auth.route");
const user_route_1 = require("../module/User/routes/user.route");
const country_route_1 = require("../module/Geo/Country/routes/country.route");
const service_route_1 = require("../module/Service/Service/routes/service.route");
// import { countryStepsOptionMapRouter } from '../module/Geo/CountryStepsOptionMap/routes/countryStepsOptionMap.route';
// import { OptionGroupRouter } from '../module/Service/OptionGroup/routes/optionGroup.route';
const option_route_1 = require("../module/Service/Option/routes/option.route");
const countryWiseService_route_1 = require("../module/Geo/CountryWiseServices/routes/countryWiseService.route");
const ServiceWiseQuestion_route_1 = require("../module/Service/ServiceWiseQuestion/routes/ServiceWiseQuestion.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.authRouter,
    },
    {
        path: '/user',
        route: user_route_1.UserProfileRouter,
    },
    {
        path: '/country',
        route: country_route_1.countryRouter,
    },
    {
        path: '/service',
        route: service_route_1.serviceRouter,
    },
    {
        path: '/country-wise-service',
        route: countryWiseService_route_1.CountryWiseServiceRouter,
    },
    {
        path: '/question',
        route: ServiceWiseQuestion_route_1.ServiceWiseQuestionRouter,
    },
    {
        path: '/option',
        route: option_route_1.OptionRouter,
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
exports.default = router;
