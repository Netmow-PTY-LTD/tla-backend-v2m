"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const optionGroupSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    respondAt: [
        {
            type: Date,
            required: true,
        },
    ],
}, {
    timestamps: true,
});
const OptionGroup = mongoose_1.default.model('OptionGroup', optionGroupSchema);
exports.default = OptionGroup;
