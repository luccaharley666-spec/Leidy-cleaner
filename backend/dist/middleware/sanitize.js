"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const sanitizeInput = (req, _res, next) => {
    // Sanitizar query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            const val = req.query[key];
            if (typeof val === 'string') {
                req.query[key] = sanitizeString(val);
            }
            else if (Array.isArray(val)) {
                req.query[key] = val.map(v => (typeof v === 'string' ? sanitizeString(v) : v));
            }
        });
    }
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
function sanitizeString(str) {
    if (typeof str !== 'string')
        return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}
function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object')
        return;
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
            obj[key] = sanitizeString(obj[key]);
        }
        else if (Array.isArray(obj[key])) {
            obj[key].forEach((item, index) => {
                if (typeof item === 'string') {
                    obj[key][index] = sanitizeString(item);
                }
                else if (typeof item === 'object') {
                    sanitizeObject(item);
                }
            });
        }
        else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
        }
    });
}
//# sourceMappingURL=sanitize.js.map