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
exports.optionController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const option_service_1 = require("./option.service");
const createOption = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionData = req.body;
    // const userId = req.user.userId;
    const result = yield option_service_1.optionService.CreateOptionIntoDB(optionData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'option Create successfully',
        data: result,
    });
}));
const getSingleOption = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionId } = req.params;
    const result = yield option_service_1.optionService.getSingleOptionFromDB(optionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Option is retrieved successfully',
        data: result,
    });
}));
const deleteSingleOption = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionId } = req.params;
    const result = yield option_service_1.optionService.deleteOptionFromDB(optionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Option delete successfully',
        data: result,
    });
}));
const updateSingleOption = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionId } = req.params;
    const payload = req.body;
    const result = yield option_service_1.optionService.updateOptionIntoDB(optionId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Option delete successfully',
        data: result,
    });
}));
const getAllOption = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield option_service_1.optionService.getAllOptionFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All Option is retrieved successfully',
        data: result,
    });
}));
exports.optionController = {
    createOption,
    getSingleOption,
    deleteSingleOption,
    updateSingleOption,
    getAllOption,
};
