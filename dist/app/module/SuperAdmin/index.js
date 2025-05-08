"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_route_1 = require("./Service/service.route");
const country_route_1 = require("./Country/country.route");
const stepsCountryWiseOptionGroupsMap_route_1 = require("./StepsCountryWiseOptionGroupsMap/stepsCountryWiseOptionGroupsMap.route");
const countryWiseServiceMap_route_1 = require("./CountryWiseServiceMap/countryWiseServiceMap.route");
const countryStepsOptionMap_route_1 = require("./CountryStepsOptionMap/countryStepsOptionMap.route");
const optionGroup_route_1 = require("./OptionGroup/optionGroup.route");
const option_route_1 = require("./Option/option.route");
const superAdminRoute = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/service',
        route: service_route_1.serviceRouter,
    },
    {
        path: '/country',
        route: country_route_1.countryRouter,
    },
    {
        path: '/steps_country_wise_service_wise_option_groups_map',
        route: stepsCountryWiseOptionGroupsMap_route_1.stepsCountryWiseOptionGroupsMapRouter,
    },
    {
        path: '/country_wise_service_map',
        route: countryWiseServiceMap_route_1.CountryWiseServiceMapRouter,
    },
    {
        path: '/country_steps_option_group-option-map',
        route: countryStepsOptionMap_route_1.countryStepsOptionMapRouter,
    },
    {
        path: '/option_groups',
        route: optionGroup_route_1.OptionGroupRouter,
    },
    {
        path: '/options',
        route: option_route_1.OptionRouter,
    },
];
moduleRoutes.forEach((route) => superAdminRoute.use(route.path, route.route));
exports.default = superAdminRoute;
