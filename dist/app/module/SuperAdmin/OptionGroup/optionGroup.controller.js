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
exports.optionGroupController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const optionGroup_service_1 = require("./optionGroup.service");
const createOptionGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionGroupData = req.body;
    // const userId = req.user.userId;
    const result = yield optionGroup_service_1.optionGroupService.CreateOptionGroupIntoDB(optionGroupData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'optionGroup Create successfully',
        data: result,
    });
}));
const getSingleOptionGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionGroupId } = req.params;
    const result = yield optionGroup_service_1.optionGroupService.getSingleOptionGroupFromDB(optionGroupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup is retrieved successfully',
        data: result,
    });
}));
const deleteSingleOptionGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionGroupId } = req.params;
    const result = yield optionGroup_service_1.optionGroupService.deleteOptionGroupFromDB(optionGroupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup delete successfully',
        data: result,
    });
}));
const updateSingleOptionGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { optionGroupId } = req.params;
    const payload = req.body;
    const result = yield optionGroup_service_1.optionGroupService.updateOptionGroupIntoDB(optionGroupId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OptionGroup delete successfully',
        data: result,
    });
}));
const getAllOptionGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_service_1.optionGroupService.getAllOptionGroupFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All OptionGroup is retrieved successfully',
        data: result,
    });
}));
exports.optionGroupController = {
    createOptionGroup,
    getSingleOptionGroup,
    deleteSingleOptionGroup,
    updateSingleOptionGroup,
    getAllOptionGroup,
};
