"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyController_1 = __importDefault(require("../controllers/CompanyController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public endpoint for company info
router.get('/', CompanyController_1.default.getInfo);
// Admin endpoint to update company information
router.put('/', auth_1.authenticate, (0, auth_1.authorizeRole)('admin'), CompanyController_1.default.upsert);
exports.default = router;
//# sourceMappingURL=company.js.map