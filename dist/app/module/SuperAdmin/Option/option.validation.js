"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionValidationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
exports.optionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').trim(),
        slug: zod_1.z.string().min(1, 'Slug is required').trim().toLowerCase(),
        option_group_obj: zod_1.z
            .string()
            .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Invalid ObjectId for option_group_obj',
        }),
        respondAt: zod_1.z
            .array(zod_1.z.date())
            .min(1, 'At least one respondAt date is required'),
    }),
});
