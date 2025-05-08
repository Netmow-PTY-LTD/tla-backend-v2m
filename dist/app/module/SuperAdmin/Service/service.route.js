"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const express_1 = require("express");
const service_controller_1 = require("./service.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
service_controller_1.serviceController.createService);
router.get('/', service_controller_1.serviceController.getAllService);
router.get('/:serviceId', service_controller_1.serviceController.getSingleService);
router.delete('/:serviceId', service_controller_1.serviceController.deleteSingleService);
router.put('/:serviceId', service_controller_1.serviceController.updateSingleService);
exports.serviceRouter = router;
