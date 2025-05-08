"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, stack = '') {
        super(message);
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
const handleCastError = (err) => {
    const errorSources = [
        {
            path: err.path,
            message: err.message,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: 'Invalid ID',
        errorSources,
    };
};
const handleDuplicateError = (err) => {
    // Extract value within double quotes using regex
    const match = err.message.match(/"([^"]*)"/);
    // The extracted value will be in the first capturing group
    const extractedMessage = match && match[1];
    const errorSources = [
        {
            path: '',
            message: `${extractedMessage} is already exists`,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: 'Invalid ID',
        errorSources,
    };
};
const handleValidationError = (err) => {
    const errorSources = Object.values(err.errors).map((val) => {
        return {
            path: val === null || val === void 0 ? void 0 : val.path,
            message: val === null || val === void 0 ? void 0 : val.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};
exports.error = {
    handleCastError,
    handleDuplicateError,
    handleValidationError,
    handleZodError,
};
