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
exports.countryWiseServiceMapController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const countryWiseServiceMap_service_1 = require("./countryWiseServiceMap.service");
const createCountryWiseServiceMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countryWiseServiceMapData = req.body;
    // const userId = req.user.userId;
    const result = yield countryWiseServiceMap_service_1.countryWiseServiceMapService.CreateCountryWiseServiceMapIntoDB(countryWiseServiceMapData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'countryWiseServiceMap Create successfully',
        data: result,
    });
}));
const getSingleCountryWiseServiceMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryWiseServiceMapId } = req.params;
    const result = yield countryWiseServiceMap_service_1.countryWiseServiceMapService.getSingleCountryWiseServiceMapFromDB(countryWiseServiceMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryWiseServiceMap is retrieved successfully',
        data: result,
    });
}));
const deleteSingleCountryWiseServiceMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryWiseServiceMapId } = req.params;
    const result = yield countryWiseServiceMap_service_1.countryWiseServiceMapService.deleteCountryWiseServiceMapFromDB(countryWiseServiceMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryWiseServiceMap delete successfully',
        data: result,
    });
}));
const updateSingleCountryWiseServiceMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryWiseServiceMapId } = req.params;
    const payload = req.body;
    const result = yield countryWiseServiceMap_service_1.countryWiseServiceMapService.updateCountryWiseServiceMapIntoDB(countryWiseServiceMapId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'CountryWiseServiceMap delete successfully',
        data: result,
    });
}));
const getAllCountryWiseServiceMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield countryWiseServiceMap_service_1.countryWiseServiceMapService.getAllCountryWiseServiceMapFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All CountryWiseServiceMap is retrieved successfully',
        data: result,
    });
}));
exports.countryWiseServiceMapController = {
    createCountryWiseServiceMap,
    getSingleCountryWiseServiceMap,
    deleteSingleCountryWiseServiceMap,
    updateSingleCountryWiseServiceMap,
    getAllCountryWiseServiceMap,
};
