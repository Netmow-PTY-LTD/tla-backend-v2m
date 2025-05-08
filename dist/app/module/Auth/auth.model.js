"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // instead of 'bcrypt'
const config_1 = __importDefault(require("../../config"));
const auth_constant_1 = require("./auth.constant");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    activeProfile: {
        type: String,
        enum: Object.values(auth_constant_1.USER_PROFILE),
        default: auth_constant_1.USER_PROFILE.BASIC,
        // enum: ['basic', 'premium', 'admin'],
        // default: 'basic',
    },
    country: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Country',
    },
    verifyCode: {
        type: String,
    },
    verifyToken: {
        type: String,
    },
    phoneNo: {
        type: String,
    },
    isPhoneVerified: {
        type: String,
        enum: Object.values(auth_constant_1.PHONE_VERIFICATION_STATUS),
        default: auth_constant_1.PHONE_VERIFICATION_STATUS.NO,
        // enum: ['yes', 'no'],
        // default: 'no',
    },
    accountStatus: {
        type: String,
        enum: Object.values(auth_constant_1.USER_STATUS),
        default: auth_constant_1.USER_STATUS.ACTIVE,
        // enum: ['active', 'suspended', 'suspended&spam'],
        // default: 'active',
    },
    googleId: {
        type: String,
    },
    isVerifiedAccount: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: String,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Password hashing
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const user = this; // doc
        // hashing password and save into DB
        user.password = yield bcryptjs_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
// set '' after saving password
userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(plainTextPassword, hashedPassword);
    });
};
userSchema.statics.isUserExists = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findById(id).select('+password');
    });
};
userSchema.statics.isUserExistsByEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({ email }).select('+password');
    });
};
exports.User = (0, mongoose_1.model)('User', userSchema);
exports.default = exports.User;
