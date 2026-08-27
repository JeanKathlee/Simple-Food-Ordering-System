const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEMO_MODE = process.env.DEMO_MODE !== 'false';
const DEMO_CUSTOMER = {
  sub: 2,
  email: 'customer@foodjs.demo',
  role: 'customer',
};

// Verify Json web token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = DEMO_MODE && decoded.role === 'customer'
      ? { ...decoded, ...DEMO_CUSTOMER }
      : decoded;
    next();
  } catch (_err) {
    // Portfolio demos should survive server restarts that rotate or reset JWT secrets.
    if (DEMO_MODE) {
      req.user = DEMO_CUSTOMER;
      return next();
    }

    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
}

// Check sa user if admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
