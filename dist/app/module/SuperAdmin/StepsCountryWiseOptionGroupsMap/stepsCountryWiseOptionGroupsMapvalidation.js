"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepsCountryWiseOptionGroupsMapValidationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
// Utility validator for ObjectId
const objectId = zod_1.z
    .string()
    .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
exports.stepsCountryWiseOptionGroupsMapValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        option_group_name: zod_1.z.string().min(1, 'must be add option group name'),
        service_ref: objectId,
        country_ref: objectId,
        step_serial: zod_1.z.number().optional(),
        respondAt: zod_1.z
            .array(zod_1.z.date())
            .length(3, 'Exactly 3 respondAt dates are required'),
    }),
});
