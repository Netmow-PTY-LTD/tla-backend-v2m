"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../module/Auth/routes/auth.route");
const user_route_1 = require("../module/User/routes/user.route");
const country_route_1 = require("../module/Country/routes/country.route");
const service_route_1 = require("../module/Service/routes/service.route");
const option_route_1 = require("../module/Option/routes/option.route");
const countryWiseMap_route_1 = require("../module/CountryWiseMap/routes/countryWiseMap.route");
const ServiceWiseQuestion_route_1 = require("../module/Question/routes/ServiceWiseQuestion.route");
const view_router_1 = require("../module/View/routes/view.router");
const leadService_routes_1 = require("../module/LeadSettings/routes/leadService.routes");
const notification_routes_1 = require("../module/Notification/routes/notification.routes");
const creditPayment_routes_1 = require("../module/CreditPayment/routes/creditPayment.routes");
const lead_route_1 = require("../module/Lead/routes/lead.route");
const response_route_1 = require("../module/LeadResponse/routes/response.route");
const logActivity_route_1 = require("../module/Activity/routes/logActivity.route");
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
        path: '/response',
        route: response_route_1.responseRouter,
    },
    {
        path: '/activity-log',
        route: logActivity_route_1.activityLogRouter,
    },
    {
        path: '/',
        route: view_router_1.viewRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
