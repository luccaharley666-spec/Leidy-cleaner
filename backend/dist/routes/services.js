"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServiceController_1 = require("../controllers/ServiceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', ServiceController_1.ServiceController.getAll);
router.get('/categories', ServiceController_1.ServiceController.getCategories);
router.get('/:id', ServiceController_1.ServiceController.getById);
// Protected routes (admin only)
router.post('/', auth_1.authenticateToken, ServiceController_1.ServiceController.create);
router.put('/:id', auth_1.authenticateToken, ServiceController_1.ServiceController.update);
router.delete('/:id', auth_1.authenticateToken, ServiceController_1.ServiceController.delete);
exports.default = router;
//# sourceMappingURL=services.js.map