"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Admin_1 = __importDefault(require("../module/Admin"));
const auth_route_1 = require("../module/Auth/routes/auth.route");
const user_route_1 = require("../module/User/routes/user.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/admin',
        route: Admin_1.default,
    },
    {
        path: '/auth',
        route: auth_route_1.authRouter,
    },
    {
        path: '/users',
        route: user_route_1.UserProfileRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
