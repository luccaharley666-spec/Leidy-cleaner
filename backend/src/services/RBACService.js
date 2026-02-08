/**
 * RBAC Service
 * Permissões granulares por role e action/resource
 */

const rolePermissions = {
  admin: [
    { action: '*', resource: '*' }
  ],
  manager: [
    { action: 'read', resource: '*' },
    { action: 'write', resource: 'reports' }
  ],
  staff: [
    { action: 'read', resource: 'bookings' },
    { action: 'write', resource: 'bookings' }
  ],
  partner: [
    { action: 'read', resource: 'analytics' }
  ],
  customer: [
    { action: 'read', resource: 'self' }
  ],
  guest: []
};

const hasPermission = (user = {}, action, resource) => {
  if (!user || !user.role) return false;
  const perms = rolePermissions[user.role] || [];

  // Admin wildcard
  if (perms.some(p => p.action === '*' && p.resource === '*')) return true;

  // Exact or wildcard matches
  return perms.some(p => {
    const actionMatch = p.action === '*' || p.action === action;
    const resourceMatch = p.resource === '*' || p.resource === resource;
    return actionMatch && resourceMatch;
  });
};

const listRoles = () => Object.keys(rolePermissions);

const addOrUpdateRole = (role, permissions = []) => {
  rolePermissions[role] = permissions;
};

module.exports = {
  hasPermission,
  listRoles,
  addOrUpdateRole
};
