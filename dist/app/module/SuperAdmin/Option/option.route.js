"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionRouter = void 0;
const express_1 = require("express");
const option_controller_1 = require("./option.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
option_controller_1.optionController.createOption);
router.get('/', option_controller_1.optionController.getAllOption);
router.get('/:optionId', option_controller_1.optionController.getSingleOption);
router.delete('/:optionId', option_controller_1.optionController.deleteSingleOption);
router.put('/:optionId', option_controller_1.optionController.updateSingleOption);
exports.OptionRouter = router;
