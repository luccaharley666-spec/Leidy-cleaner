"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewController_1 = require("../controllers/ReviewController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path_1.default.join(__dirname, '..', '..', 'uploads', 'reviews'));
    },
    filename: function (_req, _file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(_file.originalname);
        cb(null, _file.fieldname + '-' + unique + ext);
    }
});
const upload = (0, multer_1.default)({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });
// public routes (no authentication needed)
router.get('/public', ReviewController_1.ReviewController.getPublic);
// all routes below require authentication
router.use(auth_1.authenticate);
router.post('/', ReviewController_1.ReviewController.create);
router.get('/:bookingId', ReviewController_1.ReviewController.getByBooking);
// allow image uploads for a given review id (owner or admin)
router.post('/:id/images', upload.array('images', 5), ReviewController_1.ReviewController.uploadImages);
// admin only
router.get('/admin/all', ReviewController_1.ReviewController.listAll);
router.put('/admin/:id/approve', ReviewController_1.ReviewController.approve);
router.delete('/admin/:id', ReviewController_1.ReviewController.delete);
exports.default = router;
//# sourceMappingURL=reviews.js.map