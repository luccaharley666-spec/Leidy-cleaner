"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StaffController_1 = require("../controllers/StaffController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// public listing
router.get('/', StaffController_1.StaffController.list);
router.get('/:id', StaffController_1.StaffController.getById);
// protected profile updates and availability
router.put('/:id', auth_1.authenticate, StaffController_1.StaffController.updateProfile);
router.get('/:id/availability', auth_1.authenticate, StaffController_1.StaffController.getAvailability);
router.put('/:id/availability', auth_1.authenticate, StaffController_1.StaffController.setAvailability);
// reviews & rating (public)
router.get('/:id/reviews', StaffController_1.StaffController.getReviews);
router.get('/:id/rating', StaffController_1.StaffController.getRating);
exports.default = router;
//# sourceMappingURL=staff.js.map