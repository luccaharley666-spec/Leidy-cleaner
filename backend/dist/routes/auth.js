"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', AuthController_1.AuthController.register);
router.post('/login', AuthController_1.AuthController.login);
router.post('/refresh-token', AuthController_1.AuthController.refreshToken);
router.post('/logout', AuthController_1.AuthController.logout);
// Protected routes
router.get('/me', auth_1.authenticateToken, AuthController_1.AuthController.getProfile);
router.put('/me', auth_1.authenticateToken, AuthController_1.AuthController.updateProfile);
// Admin route to list users by role (e.g. ?role=staff)
router.get('/users', auth_1.authenticateToken, AuthController_1.AuthController.listByRole);
exports.default = router;
//# sourceMappingURL=auth.js.map