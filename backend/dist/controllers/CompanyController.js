"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const CompanyService_1 = __importDefault(require("../services/CompanyService"));
class CompanyController {
}
exports.CompanyController = CompanyController;
_a = CompanyController;
CompanyController.getInfo = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const company = await CompanyService_1.default.getLatest();
    if (!company)
        throw (0, errorHandler_1.ApiError)('Company info not found', 404);
    res.status(200).json({ message: 'Company info retrieved', data: { company } });
});
CompanyController.upsert = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || req.user.role !== 'admin')
        throw (0, errorHandler_1.ApiError)('Only admins can update company info', 403);
    const info = req.body;
    const updated = await CompanyService_1.default.upsert(info);
    res.status(200).json({ message: 'Company info updated', data: { company: updated } });
});
exports.default = CompanyController;
//# sourceMappingURL=CompanyController.js.map