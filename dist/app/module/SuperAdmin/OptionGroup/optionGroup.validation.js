"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionGroupValidationSchema = void 0;
const zod_1 = require("zod");
exports.optionGroupValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').trim(),
        slug: zod_1.z.string().min(1, 'Slug is required').trim().toLowerCase(),
        respondAt: zod_1.z.array(zod_1.z.date()).min(1, 'At least one date is required'),
    }),
});
