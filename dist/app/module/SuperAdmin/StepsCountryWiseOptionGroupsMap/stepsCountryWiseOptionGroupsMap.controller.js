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
exports.stepsCountryWiseOptionGroupsMapController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const stepsCountryWiseOptionGroupsMap_service_1 = require("./stepsCountryWiseOptionGroupsMap.service");
const createStepsCountryWiseOptionGroupsMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stepsCountryWiseOptionGroupsMapData = req.body;
    // const userId = req.user.userId;
    const result = yield stepsCountryWiseOptionGroupsMap_service_1.stepsCountryWiseOptionGroupsMapGroupService.CreateStepsCountryWiseOptionGroupsMapIntoDB(stepsCountryWiseOptionGroupsMapData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'stepsCountryWiseOptionGroupsMap Create successfully',
        data: result,
    });
}));
const getSingleStepsCountryWiseOptionGroupsMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const result = yield stepsCountryWiseOptionGroupsMap_service_1.stepsCountryWiseOptionGroupsMapGroupService.getSingleStepsCountryWiseOptionGroupsMapFromDB(stepsCountryWiseOptionGroupsMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup is retrieved successfully',
        data: result,
    });
}));
const deleteSingleStepsCountryWiseOptionGroupsMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const result = yield stepsCountryWiseOptionGroupsMap_service_1.stepsCountryWiseOptionGroupsMapGroupService.deleteStepsCountryWiseOptionGroupsMapFromDB(stepsCountryWiseOptionGroupsMapId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup delete successfully',
        data: result,
    });
}));
const updateSingleStepsCountryWiseOptionGroupsMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const payload = req.body;
    const result = yield stepsCountryWiseOptionGroupsMap_service_1.stepsCountryWiseOptionGroupsMapGroupService.updateStepsCountryWiseOptionGroupsMapIntoDB(stepsCountryWiseOptionGroupsMapId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup delete successfully',
        data: result,
    });
}));
const getAllStepsCountryWiseOptionGroupsMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield stepsCountryWiseOptionGroupsMap_service_1.stepsCountryWiseOptionGroupsMapGroupService.getAllStepsCountryWiseOptionGroupsMapFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All OptionGroup is retrieved successfully',
        data: result,
    });
}));
exports.stepsCountryWiseOptionGroupsMapController = {
    createStepsCountryWiseOptionGroupsMap,
    getSingleStepsCountryWiseOptionGroupsMap,
    deleteSingleStepsCountryWiseOptionGroupsMap,
    updateSingleStepsCountryWiseOptionGroupsMap,
    getAllStepsCountryWiseOptionGroupsMap,
};
