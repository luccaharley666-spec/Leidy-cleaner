"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// protected admin stats endpoint
router.get('/stats', auth_1.authenticateToken, AdminController_1.default.getStats);
exports.default = router;
//# sourceMappingURL=admin.js.map