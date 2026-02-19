"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    logger_1.logger.error(`[${status}] ${message}`, {
        path: req.path,
        method: req.method,
        error: err,
    });
    const response = {
        error: {
            message,
            status,
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const env = process.env.NODE_ENV;
    if (env === 'development') {
        response.error.stack = err.stack;
        response.error.details = err;
    }
    res.status(status).json(response);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const ApiError = (message, status = 500) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
exports.ApiError = ApiError;
//# sourceMappingURL=errorHandler.js.map