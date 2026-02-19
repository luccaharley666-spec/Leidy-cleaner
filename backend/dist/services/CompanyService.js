"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const database_1 = require("../utils/database");
function camelize(obj) {
    if (Array.isArray(obj))
        return obj.map(camelize);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => {
            const camelKey = k.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
            return [camelKey, camelize(v)];
        }));
    }
    return obj;
}
class CompanyService {
    static async getLatest() {
        const result = await (0, database_1.query)('SELECT * FROM company_info ORDER BY id DESC LIMIT 1');
        if (!result || result.length === 0)
            return null;
        return camelize(result[0]);
    }
    static async upsert(info) {
        // simple upsert: insert a new row
        const sql = `INSERT INTO company_info
      (name, legal_name, email, phone, address, city, state, country, postal_code, logo_url, description, terms, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now(),now()) RETURNING *`;
        const values = [
            info.name,
            info.legalName || info.legal_name,
            info.email,
            info.phone,
            info.address,
            info.city,
            info.state,
            info.country,
            info.postalCode || info.postal_code,
            info.logoUrl || info.logo_url,
            info.description,
            info.terms,
        ];
        const res = await (0, database_1.query)(sql, values);
        return camelize(res[0]);
    }
}
exports.CompanyService = CompanyService;
exports.default = CompanyService;
//# sourceMappingURL=CompanyService.js.map