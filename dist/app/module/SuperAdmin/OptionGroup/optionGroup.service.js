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
exports.optionGroupService = void 0;
const optionGroup_model_1 = __importDefault(require("./optionGroup.model"));
const CreateOptionGroupIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_model_1.default.create(payload);
    return result;
});
const getAllOptionGroupFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_model_1.default.find({});
    return result;
});
const getSingleOptionGroupFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_model_1.default.findById(id);
    return result;
});
const updateOptionGroupIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteOptionGroupFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield optionGroup_model_1.default.findByIdAndUpdate(id, { isDeleted: true }, {
        new: true,
    });
    return result;
});
exports.optionGroupService = {
    CreateOptionGroupIntoDB,
    getAllOptionGroupFromDB,
    getSingleOptionGroupFromDB,
    updateOptionGroupIntoDB,
    deleteOptionGroupFromDB,
};
