"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authZodValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const userZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        role: zod_1.z.string().min(1, 'Role is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        country: zod_1.z
            .string()
            .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Invalid country ObjectId',
        })
            .optional(),
    }),
});
exports.authZodValidation = {
    userZodValidationSchema,
};
