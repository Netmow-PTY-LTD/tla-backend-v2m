"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepsCountryWiseOptionGroupsMapRouter = void 0;
const express_1 = require("express");
const stepsCountryWiseOptionGroupsMap_controller_1 = require("./stepsCountryWiseOptionGroupsMap.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
stepsCountryWiseOptionGroupsMap_controller_1.stepsCountryWiseOptionGroupsMapController.createStepsCountryWiseOptionGroupsMap);
router.get('/', stepsCountryWiseOptionGroupsMap_controller_1.stepsCountryWiseOptionGroupsMapController.getAllStepsCountryWiseOptionGroupsMap);
router.get('/:stepsCountryWiseOptionGroupsMapId', stepsCountryWiseOptionGroupsMap_controller_1.stepsCountryWiseOptionGroupsMapController.getSingleStepsCountryWiseOptionGroupsMap);
router.delete('/:stepsCountryWiseOptionGroupsMapId', stepsCountryWiseOptionGroupsMap_controller_1.stepsCountryWiseOptionGroupsMapController.deleteSingleStepsCountryWiseOptionGroupsMap);
router.put('/:stepsCountryWiseOptionGroupsMapId', stepsCountryWiseOptionGroupsMap_controller_1.stepsCountryWiseOptionGroupsMapController.updateSingleStepsCountryWiseOptionGroupsMap);
exports.stepsCountryWiseOptionGroupsMapRouter = router;
