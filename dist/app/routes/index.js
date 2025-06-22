"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../module/Auth/routes/auth.route");
const user_route_1 = require("../module/User/routes/user.route");
const country_route_1 = require("../module/Geo/Country/routes/country.route");
const service_route_1 = require("../module/Service/Service/routes/service.route");
const option_route_1 = require("../module/Service/Option/routes/option.route");
const countryWiseMap_route_1 = require("../module/Geo/CountryWiseMap/routes/countryWiseMap.route");
const ServiceWiseQuestion_route_1 = require("../module/Service/Question/routes/ServiceWiseQuestion.route");
const view_router_1 = require("../module/View/routes/view.router");
const leadService_routes_1 = require("../module/Settings/LeadSettings/routes/leadService.routes");
const notification_routes_1 = require("../module/Settings/Notification/routes/notification.routes");
const creditPayment_routes_1 = require("../module/Settings/CreditPayment/routes/creditPayment.routes");
const lead_route_1 = require("../module/Lead/routes/lead.route");
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
        route: ServiceWiseQuestion_route_1.questionRouter,
    },
    {
        path: '/option',
        route: option_route_1.OptionRouter,
    },
    {
        path: '/settings/lead-service',
        route: leadService_routes_1.leadServiceRouter,
    },
    {
        path: '/settings/notification',
        route: notification_routes_1.notificationRouter,
    },
    {
        path: '/settings/credit-payment',
        route: creditPayment_routes_1.creditPaymentRouter,
    },
    {
        path: '/lead',
        route: lead_route_1.leadRouter,
    },
    {
        path: '/',
        route: view_router_1.viewRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
