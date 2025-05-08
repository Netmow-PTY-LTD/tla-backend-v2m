"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryWiseServiceMapRouter = void 0;
const express_1 = require("express");
const countryWiseServiceMap_controller_1 = require("./countryWiseServiceMap.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
countryWiseServiceMap_controller_1.countryWiseServiceMapController.createCountryWiseServiceMap);
router.get('/', countryWiseServiceMap_controller_1.countryWiseServiceMapController.getAllCountryWiseServiceMap);
router.get('/:countryWiseServiceMapId', countryWiseServiceMap_controller_1.countryWiseServiceMapController.getSingleCountryWiseServiceMap);
router.delete('/:countryWiseServiceMapId', countryWiseServiceMap_controller_1.countryWiseServiceMapController.deleteSingleCountryWiseServiceMap);
router.put('/:countryWiseServiceMapId', countryWiseServiceMap_controller_1.countryWiseServiceMapController.updateSingleCountryWiseServiceMap);
exports.CountryWiseServiceMapRouter = router;
