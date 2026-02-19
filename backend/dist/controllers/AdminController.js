"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const AdminService_1 = __importDefault(require("../services/AdminService"));
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
AdminController.getStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can access stats', 403);
    }
    const stats = await AdminService_1.default.getStats();
    res.status(200).json({ message: 'Stats retrieved', data: { stats } });
});
exports.default = AdminController;
//# sourceMappingURL=AdminController.js.map