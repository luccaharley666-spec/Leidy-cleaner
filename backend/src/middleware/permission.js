/**
 * Permission middleware using RBACService
 */
const RBAC = require('../services/RBACService');

module.exports = (action, resource) => {
  return (req, res, next) => {
    try {
      const user = req.user || {};
      if (!RBAC.hasPermission(user, action, resource)) {
        return res.status(403).json({ error: 'Permissão negada' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
