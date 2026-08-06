const jwt = require('jsonwebtoken');

module.exports = function customerAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token.' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (payload.role !== 'customer') {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    req.user = payload;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
