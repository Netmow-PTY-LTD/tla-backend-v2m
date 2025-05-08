"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryWiseServiceMapValidationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
exports.countryWiseServiceMapValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        country_obj: zod_1.z
            .string()
            .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Invalid ObjectId for country_obj',
        }),
        service_id: zod_1.z
            .array(zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Each service_id must be a valid ObjectId',
        }))
            .min(1, 'At least one service_id is required'),
        respondAt: zod_1.z
            .array(zod_1.z.date())
            .length(3, 'Exactly 3 respondAt dates are required'),
    }),
});
