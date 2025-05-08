"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SuperAdmin_1 = __importDefault(require("../module/SuperAdmin"));
const Public_1 = require("../module/Public");
const auth_route_1 = require("../module/Auth/auth.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/super-admin',
        route: SuperAdmin_1.default,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRouter,
    },
    {
        path: '/public',
        route: Public_1.publicRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
