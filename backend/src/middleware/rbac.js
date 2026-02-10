/**
 * RBAC Middleware
 * Enhanced role-based access control middleware
 */

const logger = require('../utils/logger');
const PermissionService = require('../services/PermissionService');

/**
 * Authorize by role with permission checking
 */
const authorizeByRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        logger.warn('Unauthorized access attempt - no role');
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }

      // Ensure requiredRoles is an array
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!PermissionService.hasRole(userRole, roles)) {
        logger.warn(`Unauthorized access attempt - role: ${userRole}, required: ${roles.join(',')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error(`RBAC middleware error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

/**
 * Authorize by permission
 */
const [REDACTED_TOKEN] = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }

      if (!PermissionService.hasPermission(userRole, requiredPermission)) {
        logger.warn(`Unauthorized access - permission: ${requiredPermission}, role: ${userRole}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error(`Permission middleware error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

/**
 * Authorize by multiple permissions (AND logic)
 */
const [REDACTED_TOKEN] = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }

      if (!PermissionService.hasAllPermissions(userRole, requiredPermissions)) {
        logger.warn(`Unauthorized - missing permissions: ${requiredPermissions.join(',')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error(`Multi-permission middleware error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

/**
 * Authorize by multiple permissions (OR logic)
 */
const [REDACTED_TOKEN] = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }

      if (!PermissionService.hasAnyPermission(userRole, requiredPermissions)) {
        logger.warn(`Unauthorized - no matching permissions: ${requiredPermissions.join(',')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error(`Any-permission middleware error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole !== 'admin') {
    logger.warn(`Admin access denied for user role: ${userRole}`);
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Manager or higher middleware
 */
const managerOrHigher = (req, res, next) => {
  const userRole = req.user?.role;

  const allowed = ['admin', 'manager'];
  if (!allowed.includes(userRole)) {
    logger.warn(`Manager access denied for user role: ${userRole}`);
    return res.status(403).json({
      success: false,
      error: 'Manager access required'
    });
  }

  next();
};

/**
 * Staff or higher middleware
 */
const staffOrHigher = (req, res, next) => {
  const userRole = req.user?.role;

  const allowed = ['admin', 'manager', 'staff'];
  if (!allowed.includes(userRole)) {
    logger.warn(`Staff access denied for user role: ${userRole}`);
    return res.status(403).json({
      success: false,
      error: 'Staff access required'
    });
  }

  next();
};

/**
 * Audit log middleware - log sensitive operations
 */
const auditLog = (action) => {
  return (req, res, next) => {
    // Store audit info in request for later use
    req.auditInfo = {
      action,
      user: req.user?.id,
      role: req.user?.role,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ipAddress: req.ip
    };

    // Log after response is sent
    const originalSend = res.send;
    res.send = function (data) {
      req.auditInfo.statusCode = res.statusCode;
      logger.info(`Audit Log: ${JSON.stringify(req.auditInfo)}`);
      res.send = originalSend;
      return res.send(data);
    };

    next();
  };
};

module.exports = {
  authorizeByRole,
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  adminOnly,
  managerOrHigher,
  staffOrHigher,
  auditLog
};
