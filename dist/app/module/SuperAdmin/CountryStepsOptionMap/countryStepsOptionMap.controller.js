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
exports.countryStepsOptionMapController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const countryStepsOptionMap_service_1 = require("./countryStepsOptionMap.service");
const createCountryStepsOptionMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countryStepsCountryStepsOptionMapMapData = req.body;
    // const userId = req.user.userId;
    const result = yield countryStepsOptionMap_service_1.countryStepsOptionMapService.CreateCountryStepsOptionMapIntoDB(countryStepsCountryStepsOptionMapMapData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'countryStepsCountryStepsOptionMapMap Create successfully',
        data: result,
    });
}));
const getSingleCountryStepsOptionMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryStepsOptionMapId } = req.params;
    const result = yield countryStepsOptionMap_service_1.countryStepsOptionMapService.getSingleCountryStepsOptionMapFromDB(countryStepsOptionMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryStepsOptionMap is retrieved successfully',
        data: result,
    });
}));
const deleteSingleCountryStepsOptionMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryStepsOptionMapId } = req.params;
    const result = yield countryStepsOptionMap_service_1.countryStepsOptionMapService.deleteCountryStepsOptionMapFromDB(countryStepsOptionMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryStepsOptionMap delete successfully',
        data: result,
    });
}));
const updateSingleCountryStepsOptionMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryStepsCountryStepsOptionMapMapId } = req.params;
    const payload = req.body;
    const result = yield countryStepsOptionMap_service_1.countryStepsOptionMapService.updateCountryStepsOptionMapIntoDB(countryStepsCountryStepsOptionMapMapId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryStepsOptionMap delete successfully',
        data: result,
    });
}));
const getAllCountryStepsOptionMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield countryStepsOptionMap_service_1.countryStepsOptionMapService.getAllCountryStepsOptionMapFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All CountryStepsOptionMap is retrieved successfully',
        data: result,
    });
}));
exports.countryStepsOptionMapController = {
    createCountryStepsOptionMap,
    getSingleCountryStepsOptionMap,
    deleteSingleCountryStepsOptionMap,
    updateSingleCountryStepsOptionMap,
    getAllCountryStepsOptionMap,
};
