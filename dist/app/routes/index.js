"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../module/Auth/routes/auth.route");
const user_route_1 = require("../module/User/routes/user.route");
const country_route_1 = require("../module/Geo/Country/routes/country.route");
const service_route_1 = require("../module/Service/Service/routes/service.route");
const option_route_1 = require("../module/Service/Option/routes/option.route");
const countryWiseMap_route_1 = require("../module/Geo/CountryWiseMap/routes/countryWiseMap.route");
const ServiceWiseQuestion_route_1 = require("../module/Service/ServiceWiseQuestion/routes/ServiceWiseQuestion.route");
const ServiceWiseQuestion_route_2 = require("../module/Service/Question/routes/ServiceWiseQuestion.route");
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
        path: '/country-wise-map',
        route: countryWiseMap_route_1.CountryWiseMapRouter,
    },
    {
        path: '/question',
        route: ServiceWiseQuestion_route_2.questionRouter,
    },
    {
        path: '/service-wise-questions',
        route: ServiceWiseQuestion_route_1.serviceWiseQuestionRouter,
    },
    {
        path: '/option',
        route: option_route_1.OptionRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
