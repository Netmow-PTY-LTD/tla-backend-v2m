"use strict";
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
exports.authService = void 0;
const config_1 = __importDefault(require("../../config"));
const error_1 = require("../../errors/error");
const auth_model_1 = __importDefault(require("./auth.model"));
const http_status_1 = __importDefault(require("http-status"));
const auth_utils_1 = require("./auth.utils");
const auth_constant_1 = require("./auth.constant");
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield auth_model_1.default.isUserExistsByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (!user) {
        throw new error_1.AppError(http_status_1.default.NOT_FOUND, 'This user is not found !');
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new error_1.AppError(http_status_1.default.FORBIDDEN, 'This user is deleted !');
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.accountStatus;
    if (userStatus === auth_constant_1.USER_STATUS.SUSPENDED ||
        userStatus === auth_constant_1.USER_STATUS.SUSPENDED_SPAM) {
        throw new error_1.AppError(http_status_1.default.FORBIDDEN, `This user is ${userStatus} !`);
    }
    if (!(yield auth_model_1.default.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password)))
        throw new error_1.AppError(http_status_1.default.FORBIDDEN, 'Password do not matched');
    //create token and sent to the  client
    const jwtPayload = {
        userId: user === null || user === void 0 ? void 0 : user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
        status: user === null || user === void 0 ? void 0 : user.accountStatus,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const registerUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield auth_model_1.default.isUserExistsByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (user) {
        throw new error_1.AppError(http_status_1.default.NOT_FOUND, 'This user is already exist!');
    }
    //create new user
    const newUser = yield auth_model_1.default.create(payload);
    //create token and sent to the  client
    const jwtPayload = {
        userId: newUser === null || newUser === void 0 ? void 0 : newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser === null || newUser === void 0 ? void 0 : newUser.email,
        role: newUser === null || newUser === void 0 ? void 0 : newUser.role,
        status: newUser === null || newUser === void 0 ? void 0 : newUser.accountStatus,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
exports.authService = {
    loginUserIntoDB,
    registerUserIntoDB,
};
