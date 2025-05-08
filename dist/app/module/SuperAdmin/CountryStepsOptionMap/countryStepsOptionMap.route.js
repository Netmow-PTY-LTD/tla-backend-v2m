"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryStepsOptionMapRouter = void 0;
const express_1 = require("express");
const countryStepsOptionMap_controller_1 = require("./countryStepsOptionMap.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
countryStepsOptionMap_controller_1.countryStepsOptionMapController.createCountryStepsOptionMap);
router.get('/', countryStepsOptionMap_controller_1.countryStepsOptionMapController.getAllCountryStepsOptionMap);
router.get('/:countryStepsOptionMapId', countryStepsOptionMap_controller_1.countryStepsOptionMapController.getSingleCountryStepsOptionMap);
router.delete('/:countryStepsOptionMapId', countryStepsOptionMap_controller_1.countryStepsOptionMapController.deleteSingleCountryStepsOptionMap);
router.put('/:countryStepsOptionMapId', countryStepsOptionMap_controller_1.countryStepsOptionMapController.updateSingleCountryStepsOptionMap);
exports.countryStepsOptionMapRouter = router;
