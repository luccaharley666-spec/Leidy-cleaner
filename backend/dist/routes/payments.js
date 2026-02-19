"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = __importDefault(require("../controllers/PaymentController"));
const auth_1 = require("../middleware/auth");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// regular authenticated endpoints
router.post('/', auth_1.authenticateToken, PaymentController_1.default.payBooking);
router.post('/checkout', auth_1.authenticateToken, PaymentController_1.default.checkoutSession);
// stripe webhook (raw body required)
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), PaymentController_1.default.webhook);
exports.default = router;
//# sourceMappingURL=payments.js.map