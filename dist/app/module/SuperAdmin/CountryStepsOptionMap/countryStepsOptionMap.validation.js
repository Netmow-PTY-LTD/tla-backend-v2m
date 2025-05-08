"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryStepsOptionMapValidationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
// Utility for ObjectId check
const objectId = zod_1.z
    .string()
    .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
exports.countryStepsOptionMapValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        step_ref: objectId,
        service_ref: objectId,
        option_group_ref: objectId,
        option_ids: zod_1.z.array(objectId).min(1, 'At least one option ID is required'),
        country_ref: objectId,
        respondAt: zod_1.z
            .array(zod_1.z.date())
            .length(3, 'Exactly 3 respondAt dates are required'),
    }),
});
