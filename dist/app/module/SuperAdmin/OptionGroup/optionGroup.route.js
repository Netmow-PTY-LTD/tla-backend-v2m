"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionGroupRouter = void 0;
const express_1 = require("express");
const optionGroup_controller_1 = require("./optionGroup.controller");
// import validateRequest from '../../../middlewares/validateRequest';
const router = (0, express_1.Router)();
router.post('/', 
// validateRequest(),
optionGroup_controller_1.optionGroupController.createOptionGroup);
router.get('/', optionGroup_controller_1.optionGroupController.getAllOptionGroup);
router.get('/:optionGroupId', optionGroup_controller_1.optionGroupController.getSingleOptionGroup);
router.delete('/:optionGroupId', optionGroup_controller_1.optionGroupController.deleteSingleOptionGroup);
router.put('/:optionGroupId', optionGroup_controller_1.optionGroupController.updateSingleOptionGroup);
exports.OptionGroupRouter = router;
