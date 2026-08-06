const prisma = require('../lib/prisma');

/**
 * requireRole — allow access only if req.user.role is one of the listed roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }
    next();
  };
}

/**
 * requirePermission — allow access if req.user.role === 'super_admin' OR
 * req.user.permissions contains permission string OR RDS role_permissions table grants permission.
 */
function requirePermission(...perms) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });
    if (req.user.role === 'super_admin') return next();

    const userPerms = req.user.permissions || [];
    let allowed = perms.some((p) => userPerms.includes(p));

    if (!allowed && req.user.role) {
      try {
        const dbRole = await prisma.role.findUnique({
          where: { name: req.user.role },
          include: { permissions: true },
        });
        if (dbRole) {
          const dbPermissions = dbRole.permissions.map((rp) => rp.permission);
          allowed = perms.some((p) => dbPermissions.includes(p));
        }
      } catch (err) {
        console.error('Error verifying DB role permissions:', err.message);
      }
    }

    if (!allowed) {
      return res.status(403).json({
        error: `Forbidden. Missing permission(s): ${perms.join(', ')}.`,
      });
    }
    next();
  };
}

module.exports = { requireRole, requirePermission };
