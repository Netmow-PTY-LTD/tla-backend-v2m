"use strict";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
const httpStatus_1 = require("../constant/httpStatus");
const notFound = (req, res, next) => {
    res.status(httpStatus_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'API Not Found !!',
        error: '',
    });
};
exports.default = notFound;
