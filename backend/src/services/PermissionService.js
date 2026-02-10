/**
 * Permission Service & RBAC
 * Role-Based Access Control implementation
 */

const logger = require('../utils/logger');

class PermissionService {
  constructor() {
    // Define all permissions and their required roles
    this.permissions = new Map();
    this.roles = new Map();
    this.roleHierarchy = new Map();
    
    this.[REDACTED_TOKEN]();
    this.[REDACTED_TOKEN]();
  }

  /**
   * Initialize default roles with hierarchy
   */
  [REDACTED_TOKEN]() {
    // Define role hierarchy (higher level = more permissions)
    const roles = {
      admin: {
        level: 100,
        description: 'Full system access',
        parent: null
      },
      manager: {
        level: 80,
        description: 'Manage staff and view analytics',
        parent: 'staff'
      },
      staff: {
        level: 60,
        description: 'Manage own bookings and schedule',
        parent: 'customer'
      },
      customer: {
        level: 40,
        description: 'Book services and manage profile',
        parent: null
      },
      partner: {
        level: 50,
        description: 'Advanced analytics and reporting',
        parent: 'customer'
      },
      guest: {
        level: 10,
        description: 'Limited public access',
        parent: null
      }
    };

    for (const [role, config] of Object.entries(roles)) {
      this.roles.set(role, config);
      this.roleHierarchy.set(role, config.level);
    }

    logger.info(`Initialized ${this.roles.size} roles`);
  }

  /**
   * Initialize default permissions
   */
  [REDACTED_TOKEN]() {
    const permissionMap = {
      // Auth permissions
      'auth:login': ['guest', 'customer', 'staff', 'manager', 'admin'],
      'auth:register': ['guest'],
      'auth:oauth': ['guest', 'customer', 'staff', 'manager', 'admin'],
      'auth:logout': ['customer', 'staff', 'manager', 'admin'],

      // Booking permissions
      'booking:create': ['customer', 'staff', 'manager', 'admin'],
      'booking:read': ['customer', 'staff', 'manager', 'admin'],
      'booking:update': ['staff', 'manager', 'admin'],
      'booking:delete': ['admin'],
      'booking:list': ['customer', 'staff', 'manager', 'admin'],

      // Payment permissions
      'payment:create': ['customer', 'staff', 'manager', 'admin'],
      'payment:read': ['customer', 'staff', 'manager', 'admin'],
      'payment:refund': ['manager', 'admin'],
      'payment:list': ['manager', 'admin'],

      // Review permissions
      'review:create': ['customer', 'staff', 'admin'],
      'review:read': ['guest', 'customer', 'staff', 'manager', 'admin'],
      'review:update': ['customer', 'admin'],
      'review:delete': ['admin'],

      // User permissions
      'user:read': ['customer', 'staff', 'manager', 'admin'],
      'user:update': ['customer', 'staff', 'manager', 'admin'],
      'user:delete': ['admin'],
      'user:list': ['manager', 'admin'],

      // Admin permissions
      'admin:dashboard': ['admin', 'manager'],
      'admin:analytics': ['admin', 'manager', 'partner'],
      'admin:users': ['admin'],
      'admin:staff': ['admin', 'manager'],
      'admin:settings': ['admin'],
      'admin:reports': ['admin', 'manager', 'partner'],

      // Professional/Staff permissions
      'professional:schedule': ['staff', 'manager', 'admin'],
      'professional:earnings': ['staff', 'manager', 'admin'],
      'professional:documents': ['staff', 'manager', 'admin'],

      // Search & Browse
      'search:services': ['guest', 'customer', 'staff', 'manager', 'admin', 'partner'],
      'search:professionals': ['guest', 'customer', 'staff', 'manager', 'admin', 'partner'],

      // Chat permissions
      'chat:send': ['customer', 'staff', 'manager', 'admin'],
      'chat:read': ['customer', 'staff', 'manager', 'admin'],

      // Webhook permissions
      'webhook:create': ['admin'],
      'webhook:manage': ['admin'],
      'webhook:test': ['admin'],

      // Settings
      'settings:read': ['customer', 'staff', 'manager', 'admin'],
      'settings:update': ['customer', 'staff', 'manager', 'admin'],
      'settings:twofactor': ['customer', 'staff', 'manager', 'admin'],
      'settings:privacy': ['admin'],

      // Referral
      'referral:use': ['customer', 'staff', 'manager', 'admin'],
      'referral:create': ['admin'],

      // Push Notifications
      'notification:receive': ['customer', 'staff', 'manager', 'admin'],
      'notification:manage': ['customer', 'staff', 'manager', 'admin'],

      // Reports
      'report:export': ['admin', 'manager', 'partner'],
      'report:schedule': ['admin', 'manager'],

      // Backup & Recovery
      'backup:create': ['admin'],
      'backup:restore': ['admin'],

      // API Access
      'api:access': ['customer', 'staff', 'manager', 'admin', 'partner'],
      'api:key:create': ['admin']
    };

    for (const [permission, roles] of Object.entries(permissionMap)) {
      this.permissions.set(permission, {
        name: permission,
        allowedRoles: roles,
        description: `Permission: ${permission}`
      });
    }

    logger.info(`Initialized ${this.permissions.size} permissions`);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userRole, permissionName) {
    try {
      if (!userRole) {
        return false;
      }

      const permission = this.permissions.get(permissionName);
      if (!permission) {
        logger.warn(`Unknown permission requested: ${permissionName}`);
        return false;
      }

      const allowed = permission.allowedRoles.includes(userRole);
      return allowed;
    } catch (error) {
      logger.error(`Error checking permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user is admin or higher
   */
  isAdmin(userRole) {
    return userRole === 'admin';
  }

  /**
   * Check if user has any of the required roles
   */
  hasRole(userRole, requiredRoles) {
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    return requiredRoles.includes(userRole);
  }

  /**
   * Get all permissions for a role
   */
  [REDACTED_TOKEN](role) {
    try {
      const rolePermissions = [];
      for (const [permission, config] of this.permissions.entries()) {
        if (config.allowedRoles.includes(role)) {
          rolePermissions.push({
            name: permission,
            description: config.description
          });
        }
      }
      return rolePermissions;
    } catch (error) {
      logger.error(`Error getting permissions for role: ${error.message}`);
      return [];
    }
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(role) {
    return this.roleHierarchy.get(role) || 0;
  }

  /**
   * Check if user role is higher than another
   */
  isRoleHigherThan(userRole, compareRole) {
    const userLevel = this.getRoleLevel(userRole);
    const compareLevel = this.getRoleLevel(compareRole);
    return userLevel > compareLevel;
  }

  /**
   * Get all roles with permissions
   */
  getAllRoles() {
    try {
      const result = [];
      for (const [role, config] of this.roles.entries()) {
        result.push({
          name: role,
          ...config,
          permissions: this.[REDACTED_TOKEN](role)
        });
      }
      return result;
    } catch (error) {
      logger.error(`Error getting all roles: ${error.message}`);
      return [];
    }
  }

  /**
   * Grant permission to role (dynamic)
   */
  [REDACTED_TOKEN](role, permissionName) {
    try {
      const permission = this.permissions.get(permissionName);
      if (!permission) {
        throw new Error(`Unknown permission: ${permissionName}`);
      }

      if (!permission.allowedRoles.includes(role)) {
        permission.allowedRoles.push(role);
      }

      logger.info(`Granted ${permissionName} to role ${role}`);
      return true;
    } catch (error) {
      logger.error(`Error granting permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Revoke permission from role (dynamic)
   */
  [REDACTED_TOKEN](role, permissionName) {
    try {
      const permission = this.permissions.get(permissionName);
      if (!permission) {
        throw new Error(`Unknown permission: ${permissionName}`);
      }

      const index = permission.allowedRoles.indexOf(role);
      if (index > -1) {
        permission.allowedRoles.splice(index, 1);
      }

      logger.info(`Revoked ${permissionName} from role ${role}`);
      return true;
    } catch (error) {
      logger.error(`Error revoking permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(userRole, permissionNames) {
    return permissionNames.every(permission => 
      this.hasPermission(userRole, permission)
    );
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(userRole, permissionNames) {
    return permissionNames.some(permission => 
      this.hasPermission(userRole, permission)
    );
  }

  /**
   * Get RBAC statistics
   */
  getStats() {
    return {
      totalRoles: this.roles.size,
      totalPermissions: this.permissions.size,
      rolesList: Array.from(this.roles.keys()),
      permissionsList: Array.from(this.permissions.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new PermissionService();
