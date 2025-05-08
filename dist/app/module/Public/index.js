"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/',
        route: () => { },
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.publicRouter = router;
