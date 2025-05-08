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
exports.countryService = void 0;
const country_model_1 = __importDefault(require("./country.model"));
const CreateCountryIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_model_1.default.create(payload);
    return result;
});
const getAllCountryFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_model_1.default.find({});
    return result;
});
const getSingleCountryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_model_1.default.findById(id);
    return result;
});
const updateCountryIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteCountryFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield country_model_1.default.findByIdAndUpdate(id, { isDeleted: true }, {
        new: true,
    });
    return result;
});
exports.countryService = {
    CreateCountryIntoDB,
    getAllCountryFromDB,
    getSingleCountryFromDB,
    updateCountryIntoDB,
    deleteCountryFromDB,
};
