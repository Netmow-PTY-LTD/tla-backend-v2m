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
exports.countryController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const country_service_1 = require("./country.service");
const createCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countryData = req.body;
    // const userId = req.user.userId;
    const result = yield country_service_1.countryService.CreateCountryIntoDB(countryData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'country Create successfully',
        data: result,
    });
}));
const getSingleCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryId } = req.params;
    const result = yield country_service_1.countryService.getSingleCountryFromDB(countryId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Country is retrieved successfully',
        data: result,
    });
}));
const deleteSingleCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryId } = req.params;
    const result = yield country_service_1.countryService.deleteCountryFromDB(countryId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Country delete successfully',
        data: result,
    });
}));
const updateSingleCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryId } = req.params;
    const payload = req.body;
    const result = yield country_service_1.countryService.updateCountryIntoDB(countryId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Country delete successfully',
        data: result,
    });
}));
const getAllCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_service_1.countryService.getAllCountryFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All Country is retrieved successfully',
        data: result,
    });
}));
exports.countryController = {
    createCountry,
    getSingleCountry,
    deleteSingleCountry,
    updateSingleCountry,
    getAllCountry,
};
