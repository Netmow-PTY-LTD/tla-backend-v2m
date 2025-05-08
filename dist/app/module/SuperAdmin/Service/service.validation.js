"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceValidationSchema = void 0;
const zod_1 = require("zod");
exports.ServiceValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        _id: zod_1.z.string().optional(),
        slug: zod_1.z.string(),
        respondAt: (0, zod_1.string)().optional(),
        reviewedAt: (0, zod_1.string)().optional(),
        completedAt: (0, zod_1.string)().optional(),
    }),
});
