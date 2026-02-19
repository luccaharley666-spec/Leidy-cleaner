"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("./logger");
const SALT_ROUNDS = 12;
const hashPassword = async (password) => {
    try {
        return await bcryptjs_1.default.hash(password, SALT_ROUNDS);
    }
    catch (error) {
        logger_1.logger.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    try {
        return await bcryptjs_1.default.compare(password, hash);
    }
    catch (error) {
        logger_1.logger.error('Error comparing password:', error);
        throw new Error('Failed to compare password');
    }
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=password.js.map