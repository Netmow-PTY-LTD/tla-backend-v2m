"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryRouter = void 0;
const express_1 = require("express");
const country_controller_1 = require("./country.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
country_controller_1.countryController.createCountry);
router.get('/', country_controller_1.countryController.getAllCountry);
router.get('/:countryId', country_controller_1.countryController.getSingleCountry);
router.delete('/:countryId', country_controller_1.countryController.deleteSingleCountry);
router.put('/:countryId', country_controller_1.countryController.updateSingleCountry);
exports.countryRouter = router;
